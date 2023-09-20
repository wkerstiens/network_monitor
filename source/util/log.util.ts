import {promises as fs} from 'fs';
import moment from 'moment';
import {NetworkState} from '../enums/NetworkState';

const logPath = 'network_logs';

class Logger {
    static loggingEnabled: boolean = false;



    public static logPingEvent = async (start_of_ping: moment.Moment, end_of_ping: moment.Moment, networkState: NetworkState) => {
        if (!Logger.loggingEnabled) return;
        try {
            const stats = await fs.stat(logPath);
            if (stats.isDirectory())
                await fs.appendFile(`${logPath}/${moment().format('YYYY-MM-DD')}.log`,
                    `${start_of_ping},${end_of_ping},${NetworkState[networkState].toLowerCase()}\r\n`);
        } catch (_) {
            await fs.mkdir(logPath, {recursive: true});
        }
    }
}

export default Logger;
