import moment from 'moment';
import ping from 'ping';
import Logger from './log.util';
import {NetworkState} from '../enums/NetworkState';
import {ApplicationState} from 'ApplicationState';

const checkNetwork = async (applicationState: ApplicationState): Promise<NetworkState> => {
    const start_of_ping = moment();
    const res = await ping.promise.probe(applicationState.addressToPing, {timeout: applicationState.pingTimeout, extra: ['-t', '1']});
    const end_of_ping = moment();
    const networkStatus = res.alive
        ? NetworkState.Up
        : NetworkState.Down;
    await Logger.logPingEvent(start_of_ping, end_of_ping, networkStatus);
    return networkStatus;
};
export default checkNetwork;