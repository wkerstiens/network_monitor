export const sleep = async (secondsToSleep : number) : Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, secondsToSleep * 1000));
};