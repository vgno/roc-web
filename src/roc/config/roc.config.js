import 'source-map-support/register';

import createBuilder from '../builder';
import {
    build,
    start,
    dev,
    listSettings,
    markdownSettings
} from '../commands';

const config = {
    settings: {
        runtime: {
            port: 3000,
            debug: {
                server: 'roc:*'
            },
            serve: [
                'build/client'
            ],
            favicon: '',
            startBundle: ''
        },

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
            path: '/',
            assets: [],
            mode: 'dist',
            target: ['client', 'server'],
            disableProgressbar: false,
            entry: { client: 'src/client/index.js', server: 'src/server/index.js'},
            outputName: 'app',
            outputPath: { client: 'build/client', server: 'build/server'},
            moduleBuild: false,
            moduleStyle: '',
            koaMiddlewares: 'koa-middlewares.js',
            useDefaultKoaMiddlewares: true
        }
    },

    commands: {
        build,
        start,
        dev,
        'list-settings': listSettings,
        'markdown-settings': markdownSettings
    },

    plugins: {
        createBuilder: {
            default: createBuilder
        }
    },

    extensions: []
};

/**
 * Exports the default `roc.config.js`.
 *
 * @return {object} The default `roc.config.js`.
 */
export default config;
