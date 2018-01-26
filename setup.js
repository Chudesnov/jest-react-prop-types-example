const DOMEnvironment = require('jest-environment-jsdom');

function equalArguments(a,b) {
    if (a.length !== b.length) {
        return false;
    }
    let i = a.length;
    while(--i) {
        if (a[i] !== b[i]) {
            return false;
        }
    }
    return true;
}

module.exports = class extends DOMEnvironment {
    constructor(config, options) {
        // suppressing validation error in jest-config
        const { logErrorHandlers, ...filteredEnvOptions } = config.testEnvironmentOptions;
        super({ ...config, testEnvironmentOptions: filteredEnvOptions }, options);

        // override create_process_object so .removeAllListeners and .on work as expected
        this.global.process = process;

        const listeners = [];

        // event listener capturing logic copied from jest-environment-jsdom
        const global = this.global;
        const originalAddListener = global.addEventListener;
        const originalRemoveListener = global.removeEventListener;
        let userErrorListenerCount = 0;
        global.addEventListener = function (name) {
            var a = arguments;
            if (name === 'error') {
                userErrorListenerCount++;

                // actual addEventListener emulated
                if (!listeners.find((x) => equalArguments(a,x))) {
                    listeners.push(arguments);
                }
                logErrorHandlers && global.console.info('after addEventListener', 'userErrorListenerCount is', userErrorListenerCount, 'actual listener count is', listeners.length);
            }
            return originalAddListener.apply(this, arguments);
        };
        global.removeEventListener = function (name) {
            var a = arguments;
            if (name === 'error') {
                userErrorListenerCount--;

                // actual removeEventListener emulated
                let i = listeners.findIndex((x) => equalArguments(a,x));
                if (i !== -1) {
                    listeners.splice(i, 1);
                }
                logErrorHandlers && global.console.info('after removeEventListener', 'userErrorListenerCount is', userErrorListenerCount, 'actual listener count is', listeners.length);
            }
            return originalRemoveListener.apply(this, arguments);
        };

        // utility function to clear listeners between tests
        global.removeAllErrorListeners = function() {
            while(listeners.length) {
                originalRemoveListener.apply(this, listeners.pop());
            }
            userErrorListenerCount = 0;
        }
    }
}