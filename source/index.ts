import moment from 'moment';
import ping from 'ping';
import {sleep} from "./util/sleep.util";

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

    try {
        while(true) {
            const start_of_ping = moment();
            const res = await ping.promise.probe('www.lttrust.com');
            const end_of_ping = moment();

            if(res.alive === true) {
                if(currentState === null || currentState === 'down') {
                    startOfLastUpTime = start_of_ping;
                    endOfLastUpTime = end_of_ping;
                    totalUptime += end_of_ping.diff(endOfLastUpTime, 'seconds');
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
                } else {
                    totalDowntime += end_of_ping.diff(endOfLastDownTime, 'seconds');
                    endOfLastDownTime = end_of_ping;
                }
                currentState = 'down';
            }
            console.clear();
            console.log(`
                Start of logging:        ${startOfLogging?.format('MM-DD-YYYY HH:mm:ss')}
            
                Start of Last Uptime:    ${startOfLastUpTime?.format('MM-DD-YYYY HH:mm:ss')}
                End of Last Uptime:      ${endOfLastUpTime?.format('MM-DD-YYYY HH:mm:ss')}
                
                Start of Last Downtime:  ${startOfLastDownTime?.format('MM-DD-YYYY HH:mm:ss')}
                End of Last Downtime:    ${endOfLastDownTime?.format('MM-DD-YYYY HH:mm:ss')}
                
                Total Time Network Has Been Available:    ${totalUptime} seconds
                Total Time Network Has Been Unavailable:  ${totalDowntime} seconds
            `);
            await sleep(2);
        }

    } catch (exception) {
        errorCode = 1;
        console.log(exception);
    } finally {
        return errorCode;
    }
})();