const config = {
    // Port for the server to use.
    port: 3000,
    debug: {
        // The level of debug messages that should be shown for the server, see https://www.npmjs.com/package/debug
        server: 'roc:*'
    },
    // What folder the server should expose.
    serve: [],
    // Path to the favicon file, specially handled on the server.
    favicon: '',

    dev: {
        // The level of debug messages that should be shown, see https://www.npmjs.com/package/debug
        debug: 'roc:*',
        // Port for the dev server, will need to be a free range of at least 3.
        port: 3001,
        // Files/folders that should trigger a restart of the server.
        watch: [
            'config/',
            'roc.config.js'
        ],
        // If Browsersync should reload the browser when the server is rebuilt.
        reloadOnServerChange: false,
        // If Browsersync should open the server when it has started
        open: false
    }
};

/**
 * Exports the default `roc.config.js`.
 *
 * @return {object} configFile - The default `roc.config.js`.
 */
export default config;
