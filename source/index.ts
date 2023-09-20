import {sleep} from './util/sleep.util';
import checkNetwork from './util/checkNetwork.util';
import {ApplicationState} from 'ApplicationState';
import updateScreen from './managers/screen.manager';
import {initializeApplication, updateApplicationState} from './managers/application.manager';
import {configureProcess} from './managers/process.manager';

(async (): Promise<number> => {
    const applicationState: ApplicationState = initializeApplication();
    try {
        configureProcess(applicationState);
        console.log('Loading...');
        await updateApplicationState(await checkNetwork(applicationState), applicationState);
        updateScreen(applicationState);
        do {
            await updateApplicationState(await checkNetwork(applicationState), applicationState);
            updateScreen(applicationState);
            await sleep(applicationState.secondsToSleep);
        } while (!applicationState.exitApp);

    } catch (exception) {
        applicationState.errorCode = 1;
        console.log(exception);
    }
    return applicationState.errorCode;
})();