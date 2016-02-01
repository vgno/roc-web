import 'source-map-support/register';

import {
    isInteger,
    isString,
    isBoolean,
    isPath,
    isArray,
    isArrayOrSingle
} from 'roc/validators';

const configMeta = {
    settings: {
        groups: {
            runtime: {
                koa: 'Settings for how Koa should handle paths.'
            }
        },
        descriptions: {
            runtime: {
                port: 'Port for the server to use.',
                debug: {
                    server: 'Filter for debug messages that should be shown for the server, see ' +
                        'https://npmjs.com/package/debug.'
                },
                serve: 'What folder the server should expose.',
                favicon: 'Path to the favicon file, specially handled on the server.',
                startBundle: 'Relative path to a bundle to start when calling "start", is not needed in most cases.',
                koa: {
                    lowercase: {
                        enabled: 'If paths should be transformed to lowercase.',
                        defer: 'If this should be performed after looking for a file on disk.'
                    },
                    normalize: {
                        enabled: 'If paths should be normalized, that is remove extra slashes.',
                        defer: 'If this should be performed after looking for a file on disk.'
                    },
                    trailingSlashes: {
                        enabled: 'Set to true to enforce trailing slashes, false to remove them and null for no rule.',
                        defer: 'If this should be performed after looking for a file on disk.'
                    }
                }
            },

            dev: {
                debug: 'Filter for debug messages that should be shown for the server, see ' +
                    'https://npmjs.com/package/debug.',
                port: 'Port for the dev server, will need to be a free range of at least 3.',
                watch: 'Files/folders that should trigger a restart of the server.',
                reloadOnServerChange: 'If Browsersync should reload the browser when the server is rebuilt.',
                open: 'If Browsersync should open the server when it has started.',
                devMiddleware: {
                    noInfo: 'If no info should be sent to the console.',
                    quiet: 'If nothing should be sent to the console.'
                },
                hotMiddleware: {
                    reload: 'If the browser should be reloaded if it fails to hot update the code.',
                    noInfo: 'If no info should be sent to the console.',
                    quiet: 'If nothing should be sent to the console.'
                }
            },

            build: {
                path: 'The basepath for the application.',
                assets: 'An array of files to include into the build process.',
                verbose: 'If verbose mode should be used, returns more output during build.',
                mode: 'What mode the application should be built for. Possible values are "dev", "dist" and "test".',
                target: 'For what target the application should be built for. Possible values are "client" & "server".',
                disableProgressbar: 'Should the progress bar be disabled for builds.',
                entry: {
                    client: 'The client entry point file.',
                    server: 'The server entry point file.'
                },
                outputName: 'The name of the generated application bundle, will be appended "roc.js".',
                outputPath: {
                    client: 'The output directory for the client build.',
                    server: 'The output directory for the server build.'
                },
                moduleBuild: 'NOT IMPLEMENTED YET',
                moduleStyle: 'NOT IMPLEMENTED YET',
                koaMiddlewares: 'The koa middlewares to add to the server instance, will be added after the default ' +
                    ' middlewares.',
                useDefaultKoaMiddlewares: 'If Roc should use internally defined koa middlewares, please look at the ' +
                    ' documentation for what middlewares that are included.'
            }
        },

        validations: {
            runtime: {
                port: isInteger,
                debug: {
                    server: isString
                },
                serve: isArrayOrSingle(isPath),
                favicon: isString,
                startBundle: isPath,
                koa: {
                    lowercase: {
                        enabled: isBoolean,
                        defer: isBoolean
                    },
                    normalize: {
                        enabled: isBoolean,
                        defer: isBoolean
                    },
                    trailingSlashes: {
                        enabled: isBoolean,
                        defer: isBoolean
                    }
                }
            },

            dev: {
                debug: isString,
                port: isInteger,
                watch: isArrayOrSingle(isPath),
                reloadOnServerChange: isBoolean,
                open: isBoolean,
                devMiddleware: {
                    noInfo: isBoolean,
                    quiet: isBoolean
                },
                hotMiddleware: {
                    reload: isBoolean,
                    noInfo: isBoolean,
                    quiet: isBoolean
                }
            },

            build: {
                path: isPath,
                assets: isArray(isPath),
                mode: /^dev|dist|test$/i,
                target: isArray(/^client|server$/i),
                disableProgressbar: isBoolean,
                entry: {
                    client: isPath,
                    server: isPath
                },
                outputName: isString,
                outputPath: {
                    client: isPath,
                    server: isPath
                },
                koaMiddlewares: isPath,
                useDefaultKoaMiddlewares: isBoolean
            }
        }
    },

    commands: {
        'build': {
            settings: ['build'],
            description: 'Build the current project.'
        },
        'start': {
            settings: ['runtime'],
            description: 'Starts the current project.',
            arguments: [{
                name: 'artifact',
                validation: isPath
            }]
        },
        'dev': {
            settings: true,
            description: 'Starts the current project in dev mode.'
        },
        'list-settings': {
            description: 'Prints all the available settings can be changed.'
        },
        'markdown-settings': {
            description: 'Prints all the available settings can be changed in a markdown format.'
        }
    },

    plugins: {
        createBuilder: 'Used to define and extend the internal builder. See documentation for more information.'
    }
};

/**
 * Exports the `roc.config.meta.js`.
 *
 * @return {object} The `roc.config.meta.js`.
 */
export default configMeta;
