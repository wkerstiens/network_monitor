import moment from 'moment';
import {NetworkState} from '../enums/NetworkState';

export type ApplicationState = {
    errorCode: number;
    totalUptime: number;
    totalDowntime: number;
    startOfLogging: moment.Moment | null;
    startOfLastDownTime: moment.Moment | null;
    endOfLastDownTime: moment.Moment | null;
    startOfLastUpTime: moment.Moment | null;
    endOfLastUpTime: moment.Moment | null;
    currentState: NetworkState;
    totalTimesDown: number;
    totalTimesUp: number;
    soundOn: boolean;
    exitApp: boolean;
    secondsToSleep: number;
    pingTimeout: number;
    addressToPing: string;
};
