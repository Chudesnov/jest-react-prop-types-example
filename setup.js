const DOMEnvironment = require('jest-environment-jsdom');

module.exports = class extends DOMEnvironment {
    constructor(config, options) {
        // suppress validation error in jest-config
        const { logErrorHandlers, throwOnReactWarnings, ...filteredEnvOptions } = config.testEnvironmentOptions;

        super({ ...config, testEnvironmentOptions: filteredEnvOptions }, options);
        this.config = { logErrorHandlers, throwOnReactWarnings };

        if (logErrorHandlers) {
            const global = this.global;
            const originalAddListener = global.addEventListener;
            const originalRemoveListener = global.removeEventListener;
            let userErrorListenerCount = 0;
            global.addEventListener = function (name) {
            if (name === 'error') {
                userErrorListenerCount++;
                global.console.log('userErrorListenerCount is', userErrorListenerCount);
            }
            return originalAddListener.apply(this, arguments);
            };
            global.removeEventListener = function (name) {
            if (name === 'error') {
                userErrorListenerCount--;
                global.console.log('userErrorListenerCount is', userErrorListenerCount);
            }
            return originalRemoveListener.apply(this, arguments);
            };
        }
    }
    setup() {
        const console = this.global.console;
        const error = console.error;

        this.config.throwOnReactWarnings && (console.error = (message, ...args) => {
            if (/^Warning: /.test(message)) {
                this.config.preventJSDOMErrors && this.preventJSDOMError()
                throw new Error(message);
            }

            error.call(console, message, ...args);
        })

        return Promise.resolve().then(() => super.setup());
    }

    preventJSDOMError() {
        const onError = event => {
            this.dom.window.removeEventListener('error', onError, true);
            event.preventDefault();
            event.error.suppressReactErrorLogging = true;
        }
        this.dom.window.addEventListener('error', onError, true);
        Promise.resolve().then(() => {
            this.dom && this.dom.window.removeEventListener('error', onError, true);
        })
    }
}