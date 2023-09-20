import moment from 'moment';
import {ApplicationState} from 'ApplicationState';
import {NetworkState} from '../enums/NetworkState';
import Logger from '../util/log.util';

const minute = 60;
const hour = minute * 60;
const day = hour * 24;

const dateTimeFormat = 'MM-DD-YYYY HH:mm:ss';

const formatNumber = (time: number, seconds: number, digits = 2, padding = 10): string => {
    return (time / seconds).toFixed(digits).toString().padStart(padding);
};

const formatTime = (time: moment.Moment | null): string => {
    return time ? time.format(dateTimeFormat) : '<Waiting for data>';
};

const updateScreen = (applicationState: ApplicationState) => {
    console.clear();
    console.log(`
    Start of Last Uptime:    ${formatTime(applicationState.startOfLastUpTime)}    Start of Last Downtime:  ${formatTime(applicationState.startOfLastDownTime)}
    End of Last Uptime:      ${formatTime(applicationState.endOfLastUpTime)}    End of Last Downtime:    ${formatTime(applicationState.endOfLastDownTime)}
    
    Total Time Available:    ${formatNumber(applicationState.totalUptime, 1, 0)} seconds     Total Time Unavailable:  ${formatNumber(applicationState.totalDowntime, 1, 0)} seconds
    Total Time Available:    ${formatNumber(applicationState.totalUptime, minute)} minutes     Total Time Unavailable:  ${formatNumber(applicationState.totalDowntime, minute)} minutes
    Total Time Available:    ${formatNumber(applicationState.totalUptime, hour)} hours       Total Time Unavailable:  ${formatNumber(applicationState.totalDowntime, hour)} hours
    Total Time Available:    ${formatNumber(applicationState.totalUptime, day)} days        Total Time Unavailable:  ${formatNumber(applicationState.totalDowntime, day)} days

    Total number of times the network has recovered:  ${applicationState.totalTimesUp}
    Total number of times the network has crashed:    ${applicationState.totalTimesDown}
    
    Network is currently ${NetworkState[applicationState.currentState].toLowerCase()}
    Network has been up ${formatNumber(applicationState.totalUptime / (applicationState.totalUptime + applicationState.totalDowntime) * 100, 1, 2, 0)}% of the time since this session began.
    
           Sound is : ${(applicationState.soundOn ? 'on' : 'off')}
         Logging is : ${(Logger.loggingEnabled ? 'on' : 'off')}   Logging started began at ${formatTime(applicationState.startOfLogging)}
    Seconds to sleep: ${applicationState.secondsToSleep}
    
    Problems, contact Rise Broadband at:
            Customer Care:  844-816-9149
        Technical Support:  877-910-6207
                    Other:  844-411-RISE (7473)
    `);
};

export default updateScreen;