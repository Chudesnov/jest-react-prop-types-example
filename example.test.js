function triggerWindowError() {
    const element = document.createElement('someelement');
    const event = document.createEvent('Event');
    const handler = () => {
        throw new Error(); // this will trigger window.onerror
    }

    element.addEventListener('someevent', handler)
    event.initEvent('someevent', false, false);
    element.dispatchEvent(event); // will call handler;
    element.removeEventListener('someevent', handler);
}

describe('jest-environment-jsdom', () => {
    let uncaughtExceptionHandler = jest.fn().mockName('uncaughtExceptionHandler');
    beforeAll(() => {
        process.removeAllListeners('uncaughtException'); // jest-runner and others may intercept
        process.on('uncaughtException', uncaughtExceptionHandler);
        jest.spyOn(console, 'error');
        console.error.mockImplementation(() => {})
    });
    afterAll(() => {
        jest.clearAllMocks();
        removeAllErrorListeners();
        process.removeListener('uncaughtException', uncaughtExceptionHandler);
    });
    it('onerror should not trigger uncaughtException', () => {
        // setting incorrect userErrorListenerCount
        window.addEventListener('error', () => {/* add a listener */});
        window.removeEventListener('error', () => {/* remove some other listener */});
        
        triggerWindowError();

        expect(uncaughtExceptionHandler).not.toBeCalled();
    });
});