import {ApplicationState} from 'ApplicationState';
import process from 'process';
import Logger from '../util/log.util';
import moment from 'moment';
import updateScreen from './screen.manager';

export const configureProcess = (applicationState: ApplicationState) => {
    process.stdin.setRawMode(true);
    process.stdin.on('data',
        keystroke => {
            const key = String.fromCharCode(keystroke[0]).toLowerCase();
            if (key === 's') applicationState.soundOn = !applicationState.soundOn;
            else if (key === 'l') {
                Logger.loggingEnabled = !Logger.loggingEnabled;
                if (Logger.loggingEnabled) applicationState.startOfLogging = moment();
                else applicationState.startOfLogging = null;
            } else if (key === '-') applicationState.secondsToSleep = applicationState.secondsToSleep > 5
                ? applicationState.secondsToSleep - 5
                : applicationState.secondsToSleep;
            else if (key === '+') applicationState.secondsToSleep = applicationState.secondsToSleep < 3600
                ? applicationState.secondsToSleep + 5
                : applicationState.secondsToSleep;
            else if (key === 'x' || key === 'q' || keystroke[0] === 3) {
                applicationState.exitApp = !applicationState.exitApp;
                process.stdin.setRawMode(false);
                process.exit(0);
            }
            updateScreen(applicationState);
        });
};
