import {ApplicationState} from 'ApplicationState';
import {NetworkState} from '../enums/NetworkState';
import moment from 'moment';
import sound from 'sound-play';
import path from 'path';

const sound_file = path.join('sounds', 'AirHorn.mp3');
const sound_level = 0.01;
const playSound = async () => {
    await sound.play(sound_file, sound_level);
};

export const initializeApplication = (): ApplicationState => {
    return {
        errorCode: 0,
        totalUptime: 0,
        totalDowntime: 0,
        startOfLogging: null,
        startOfLastDownTime: null,
        endOfLastDownTime: null,
        startOfLastUpTime: null,
        endOfLastUpTime: null,
        currentState: NetworkState.Unknown,
        totalTimesDown: 0,
        totalTimesUp: 0,
        soundOn: false,
        exitApp: false,
        secondsToSleep: 5,
        pingTimeout: 3,
        addressToPing: '8.8.8.8'
    };
};

export const updateApplicationState = async (networkState: NetworkState, applicationState: ApplicationState) => {
    const {endOfLastUpTime, endOfLastDownTime} = applicationState;
    const stateChanged = networkState === applicationState.currentState;
    if (networkState === NetworkState.Up)
        if (applicationState.currentState === NetworkState.Unknown || applicationState.currentState === NetworkState.Down) {
            applicationState.startOfLastUpTime = moment();
            applicationState.endOfLastUpTime = moment();
            if (endOfLastUpTime)
                applicationState.totalUptime += applicationState.endOfLastUpTime.diff(endOfLastUpTime, 'seconds');
            if (applicationState.currentState === NetworkState.Down) applicationState.totalTimesUp++;
        } else {
            applicationState.endOfLastUpTime = moment();
            applicationState.totalUptime += applicationState.endOfLastUpTime.diff(endOfLastUpTime, 'seconds');
        }
    else if (networkState === NetworkState.Down)
        if (applicationState.currentState === NetworkState.Unknown || applicationState.currentState === NetworkState.Up) {
            applicationState.startOfLastDownTime = moment();
            applicationState.endOfLastDownTime = moment();
            if (endOfLastDownTime)
                applicationState.totalDowntime += applicationState.endOfLastDownTime.diff(endOfLastDownTime, 'seconds');
            if (applicationState.currentState === NetworkState.Up) applicationState.totalTimesDown++;
        } else {
            applicationState.endOfLastDownTime = moment();
            applicationState.totalUptime += applicationState.endOfLastDownTime.diff(endOfLastDownTime, 'seconds');
        }

    if (stateChanged) await playSound();

    applicationState.currentState = networkState;
};