const configMeta = {
    port: 'Port for the server to use',
    debug: {
        server: 'Filter for debug messages that should be shown for the server, see https://www.npmjs.com/package/debug'
    },
    serve: 'What folder the server should expose',
    favicon: 'Path to the favicon file, specially handled on the server',
    path: 'The basepath for the application',

    dev: {
        debug: 'Filter for debug messages that should be shown for the server, see https://www.npmjs.com/package/debug',
        port: 'Port for the dev server, will need to be a free range of at least 3',
        watch: 'Files/folders that should trigger a restart of the server',
        reloadOnServerChange: 'If Browsersync should reload the browser when the server is rebuilt',
        open: 'If Browsersync should open the server when it has started',
        devMiddleware: {
            noInfo: 'If no info should be sent to the console',
            quiet: 'If nothing should be sent to the console'
        },
        hotMiddleware: {
            reload: 'If the browser should be reloaded if it fails to hot update the code',
            noInfo: 'If no info should be sent to the console',
            quiet: 'If nothing should be sent to the console'
        }
    },

    build: {
        verbose: 'If verbose mode should be used, returns more output during build',
        mode: 'What mode the application should be built for. Possible values are "dev", "dist" and "test"',
        target: 'For what target the application should be built for. Possible values are "client" and "server"',
        entry: {
            client: 'The client entry point file',
            server: 'The server entry point file'
        },
        outputName: 'The name of the generated application bundle, will be appended "roc.js"',
        outputPath: {
            client: 'The output directory for the client build',
            server: 'The output directory for the server build'
        },
        moduleBuild: 'NOT IMPLEMENTED YET',
        moduleStyle: 'NOT IMPLEMENTED YET'
    }
};

/**
 * Exports the `roc.config.meta.js`.
 *
 * @todo Implement
 *
 * @return {object} The `roc.config.meta.js`.
 */
export default configMeta;
