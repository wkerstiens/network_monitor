import moment from 'moment';
import ping from 'ping';
import {sleep} from './util/sleep.util';
import sound from 'sound-play';
import path from 'path';
import {promises as fs} from 'fs';
import * as process from 'process';

enum State {
    Up,
    Down,
    Unknown
}

const logPath = 'network_logs';
const sound_file = path.join('sounds', 'AirHorn.mp3');
const sound_level = 0.01;

const pingTimeout = 3;
const minute = 60;
const hour = minute * 60;
const day = hour * 24;
const addressToPing = '8.8.8.8';
const dateTimeFormat = 'MM-DD-YYYY HH:mm:ss';

let errorCode = 0;
let totalUptime = 0;
let totalDowntime = 0;
let startOfLogging: moment.Moment | null = null;
let startOfLastDownTime: moment.Moment | null = null;
let endOfLastDownTime: moment.Moment | null = null;
let startOfLastUpTime: moment.Moment | null = null;
let endOfLastUpTime: moment.Moment | null = null;
let currentState = State.Unknown;
let totalTimesDown = 0;
let totalTimesUp = 0;
let soundOn = false;
let logging = false;
let exitApp = false;

let secondsToSleep = 5;

const formatNumber = (time: number, seconds: number, digits = 2, padding = 10): string => {
    return (time / seconds).toFixed(digits).toString().padStart(padding);
};

const formatTime = (time: moment.Moment | null): string => {
    return time ? time.format(dateTimeFormat) : '<Waiting for data>';
};

const updateScreen = () => {
    console.clear();
    console.log(`
    Start of Last Uptime:    ${formatTime(startOfLastUpTime)}    Start of Last Downtime:  ${formatTime(startOfLastDownTime)}
    End of Last Uptime:      ${formatTime(endOfLastUpTime)}    End of Last Downtime:    ${formatTime(endOfLastDownTime)}
    
    Total Time Available:    ${formatNumber(totalUptime, 1, 0)} seconds     Total Time Unavailable:  ${formatNumber(totalDowntime, 1, 0)} seconds
    Total Time Available:    ${formatNumber(totalUptime, minute)} minutes     Total Time Unavailable:  ${formatNumber(totalDowntime, minute)} minutes
    Total Time Available:    ${formatNumber(totalUptime, hour)} hours       Total Time Unavailable:  ${formatNumber(totalDowntime, hour)} hours
    Total Time Available:    ${formatNumber(totalUptime, day)} days        Total Time Unavailable:  ${formatNumber(totalDowntime, day)} days

    Total number of times the network has recovered:  ${totalTimesUp}
    Total number of times the network has crashed:    ${totalTimesDown}
    
    Network is currently ${State[currentState].toLowerCase()}
    Network has been up ${formatNumber(totalUptime / (totalUptime + totalDowntime) * 100, 1, 2, 0)}% of the time since this session began.
    
           Sound is : ${(soundOn ? 'on' : 'off')}
         Logging is : ${(logging ? 'on' : 'off')}   Logging started began at ${formatTime(startOfLogging)}
    Seconds to sleep: ${secondsToSleep}
    
    Problems, contact Rise Broadband at:
            Customer Care:  844-816-9149
        Technical Support:  877-910-6207
                    Other:  844-411-RISE (7473)
    `);
};

const checkNetwork = async (): Promise<void> => {
    const start_of_ping = moment();
    const res = await ping.promise.probe(addressToPing, {timeout: pingTimeout, extra: ['-t', '1']});
    const end_of_ping = moment();

    if (res.alive) {
        if (currentState === State.Unknown || currentState === State.Down) {
            startOfLastUpTime = start_of_ping;
            endOfLastUpTime = end_of_ping;
            totalUptime += end_of_ping.diff(endOfLastUpTime, 'seconds');
            if (soundOn) sound.play(sound_file, sound_level);
            if (currentState === State.Down) totalTimesUp++;
        } else {
            totalUptime += end_of_ping.diff(endOfLastUpTime, 'seconds');
            endOfLastUpTime = end_of_ping;
        }
        currentState = State.Up;
    } else if (!res.alive) {
        if (currentState === State.Unknown || currentState === State.Up) {
            startOfLastDownTime = start_of_ping;
            endOfLastDownTime = end_of_ping;
            totalDowntime += end_of_ping.diff(endOfLastDownTime, 'seconds');
            if (soundOn) sound.play(sound_file, sound_level);
            if (currentState === State.Up) totalTimesDown++;
        } else {
            totalDowntime += end_of_ping.diff(endOfLastDownTime, 'seconds');
            endOfLastDownTime = end_of_ping;
        }
        currentState = State.Down;
    }
    if (logging) await log(start_of_ping, end_of_ping);
};

const log = async (start_of_ping: moment.Moment, end_of_ping: moment.Moment): Promise<void> => {
    try {
        const stats = await fs.stat(logPath);
        if(stats.isDirectory())
            await fs.appendFile(`${logPath}/${moment().format('YYYY-MM-DD')}.log`,
                `${start_of_ping},${end_of_ping},${State[currentState].toLowerCase()}\r\n`);
    } catch (_) {
        await fs.mkdir(logPath, {recursive: true});
    }
};

process.stdin.setRawMode(true);
process.stdin.on('data', keystroke => {
    const key = String.fromCharCode(keystroke[0]).toLowerCase();
    if (key === 's') soundOn = !soundOn;
    else if (key === 'l') {
        logging = !logging;
        if (logging) startOfLogging = moment();
        else startOfLogging = null;
    } else if (key === '-') secondsToSleep = secondsToSleep > 5 ? secondsToSleep - 5 : secondsToSleep;
    else if (key === '+') secondsToSleep = secondsToSleep < 3600 ? secondsToSleep + 5 : secondsToSleep;
    else if (key === 'x' || key === 'q' || keystroke[0] === 3) {
        exitApp = !exitApp;
        process.stdin.setRawMode(false);
        process.exit(0);
    }
    updateScreen();
});

(async (): Promise<number> => {
    try {
        console.log('Loading...');
        await checkNetwork();
        await sleep(1);
        updateScreen();
        do {
            await checkNetwork();
            updateScreen();
            await sleep(secondsToSleep);
        } while (!exitApp);

    } catch (exception) {
        errorCode = 1;
        console.log(exception);
    }
    return errorCode;
})();