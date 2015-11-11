const config = {
    port: 3000,
    debug: {
        server: 'roc:*'
    },
    serve: [
        'build/client'
    ],
    favicon: '',

    dev: {
        debug: 'roc:*',
        port: 3001,
        watch: [
            'config/',
            'roc.config.js'
        ],
        reloadOnServerChange: false,
        open: false,
        devMiddleware: {
            noInfo: true,
            quiet: false
        },
        hotMiddleware: {
            reload: false,
            noInfo: false,
            quiet: false
        }
    },

    build: {
        mode: 'dist',
        target: ['client', 'server'],
        entry: { client: 'src/client/index.js', server: 'src/server/index.js'},
        outputPath: { client: 'build/client', server: 'build/server'},
        moduleBuild: false,
        moduleStyle: ''
    }
};

/**
 * Exports the default `roc.config.js`.
 *
 * @return {object} The default `roc.config.js`.
 */
export default config;
