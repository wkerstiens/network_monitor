import moment from 'moment';
import ping from 'ping';
import {sleep} from "./util/sleep.util";
import sound from "sound-play";
import path from 'path';
import {promises as fs} from 'fs';

(async () : Promise<number> => {
    let errorCode = 0;
    let totalUptime = 0;
    let totalDowntime = 0;
    const startOfLogging = moment();
    let startOfLastDownTime : moment.Moment | null = null;
    let endOfLastDownTime : moment.Moment | null = null;
    let startOfLastUpTime : moment.Moment | null = null;
    let endOfLastUpTime : moment.Moment | null = null;
    let currentState : string | null = null;
    const sound_file = path.join('sounds', 'AirHorn.mp3');

    try {
        console.clear();
        while(true) {
            const start_of_ping = moment();
            const res = await ping.promise.probe('72.19.150.33', { timeout: 1, extra: ['-t', '1'] });
            const end_of_ping = moment();

            if(res.alive === true) {
                if(currentState === null || currentState === 'down') {
                    startOfLastUpTime = start_of_ping;
                    endOfLastUpTime = end_of_ping;
                    totalUptime += end_of_ping.diff(endOfLastUpTime, 'seconds');
                    try {
                        await sound.play(sound_file, .05);
                    } catch (error) {

                    }
                } else {
                    totalUptime += end_of_ping.diff(endOfLastUpTime, 'seconds');
                    endOfLastUpTime = end_of_ping;
                }
                currentState = 'up';
            } else if(res.alive === false) {
                if(currentState === null || currentState === 'up') {
                    startOfLastDownTime = start_of_ping;
                    endOfLastDownTime = end_of_ping;
                    totalDowntime += end_of_ping.diff(endOfLastDownTime, 'seconds');
                    try {
                        await sound.play(sound_file, .05);
                    } catch (error) {

                    }
                } else {
                    totalDowntime += end_of_ping.diff(endOfLastDownTime, 'seconds');
                    endOfLastDownTime = end_of_ping;
                }
                currentState = 'down';
            }
            console.clear();
            console.log(`
    Start of logging:        ${startOfLogging?.format('MM-DD-YYYY HH:mm:ss')}

    Start of Last Uptime:    ${startOfLastUpTime?.format('MM-DD-YYYY HH:mm:ss')}    Start of Last Downtime:  ${startOfLastDownTime?.format('MM-DD-YYYY HH:mm:ss')}
    End of Last Uptime:      ${endOfLastUpTime?.format('MM-DD-YYYY HH:mm:ss')}    End of Last Downtime:    ${endOfLastDownTime?.format('MM-DD-YYYY HH:mm:ss')}
    
    Total Time Available:    ${totalUptime.toString().padStart(10)} seconds    Total Time Unavailable:  ${totalDowntime.toString().padStart(10)} seconds
    Total Time Available:    ${(totalUptime / 60).toFixed(2).padStart(10)} minutes    Total Time Unavailable:  ${(totalDowntime / 60).toFixed(2).padStart(10)} minutes
    Total Time Available:    ${(totalUptime / 60 / 60).toFixed(2).padStart(10)} hours      Total Time Unavailable:  ${(totalDowntime / 60 / 60).toFixed(2).padStart(10)} hours
    Total Time Available:    ${(totalUptime / 60 / 60 / 24).toFixed(2).padStart(10)} days       Total Time Unavailable:  ${(totalDowntime / 60 / 60 / 24).toFixed(2).padStart(10)} days


    
    
    
    
    
    Network is currently ${currentState}
    Network has been up ${(totalUptime/(totalUptime+totalDowntime) * 100).toFixed(2)}% of the time since this session began.
            `);
            await fs.appendFile(`/Users/wak/network_logs/${moment().format('YYYYMMDD')}.log`, `${start_of_ping},${end_of_ping},${currentState}\r\n`);
            await sleep(2);
        }

    } catch (exception) {
        errorCode = 1;
        console.log(exception);
    } finally {
        return errorCode;
    }
})();