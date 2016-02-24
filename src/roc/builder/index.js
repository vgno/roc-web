import 'source-map-support/register';

import fs from 'fs';
import path from 'path';
import autoprefixer from 'autoprefixer';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import { getSettings, getAbsolutePath } from 'roc';

import { getDevPath, removeTrailingSlash, addTrailingSlash } from '../helpers/general';
import { writeStats } from './utils/stats';

const bourbon = './node_modules/bourbon/app/assets/stylesheets/';
const neat = './node_modules/bourbon-neat/app/assets/stylesheets/';

/**
 * Creates a builder.
 *
 * @param {!string} target - a target: should be either "client" or "server"
 * @param {rocBuilder} rocBuilder - A rocBuilder to base everything on.
 * @param {!string} [resolver=roc-web/lib/helpers/get-resolve-path] - Path to the resolver for the server side
 * {@link getResolvePath}
 * @returns {rocBuilder}
 */
export default function createBuilder(target, { buildConfig = {}, builder = require('webpack') },
    resolver = 'roc-web/lib/helpers/get-resolve-path') {
    const allowedTargets = ['server', 'client'];

    if (allowedTargets.indexOf(target) === -1) {
        throw new Error(`Invalid target, must be one of ${allowedTargets}. Was instead ${target}.`);
    }

    const settings = getSettings('build');

    const DEV = (settings.mode === 'dev');
    const TEST = (settings.mode === 'test');
    const DIST = (settings.mode === 'dist');

    const SERVER = (target === 'server');
    const CLIENT = (target === 'client');

    const COMPONENT_BUILD = !!settings.moduleBuild;

    const ENV = DIST ? 'production' : 'development';

    const entry = getAbsolutePath(settings.entry[target]);
    const outputPath = getAbsolutePath(settings.outputPath[target]);
    const componentStyle = getAbsolutePath(settings.moduleStyle);

    if (DIST) {
        buildConfig.bail = true;
    }

    /**
    * Entry
    */
    if (SERVER) {
        buildConfig.entry = {
            [settings.outputName]: [
                require.resolve('../../src/app/server-entry')
            ]
        };
    } else if (TEST) {
        buildConfig.entry = {};
    } else if (CLIENT && DEV) {
        buildConfig.entry = {
            [settings.outputName]: [
                `webpack-hot-middleware/client?path=${getDevPath()}__webpack_hmr`,
                entry
            ]
        };
    } else if (CLIENT) {
        buildConfig.entry = {
            [settings.outputName]: [
                entry
            ]
        };
    }

    if (CLIENT) {
        const makeAllPathsAbsolute = (input) => input.map((elem) => getAbsolutePath(elem));

        const assets = makeAllPathsAbsolute(settings.assets);
        buildConfig.entry[settings.outputName] = buildConfig.entry[settings.outputName].concat(assets);
    }

    /**
    * Target
    */
    if (SERVER) {
        buildConfig.target = 'node';
    }

    if (SERVER) {
        buildConfig.externals = [
            {
                [resolver]: true,
                ['roc-web/lib/helpers/config']: true
            },
            function(context, request, callback) {
                const regexp = /roc-[^\/]+\/([^\/]+)/;
                const match = regexp.exec(request);

                // If a roc module include it if app is the next on the path
                // Will include for example "roc-web/app" & "roc-web-react/app/server" but not "roc-web/lib" & "roc-web"
                if (match && match[1] === 'app') {
                    return callback();
                }

                // If a normal node_module mark it as external
                if (/^[a-zA-Z\-0-9]{1}.*$/.test(request)) {
                    return callback(null, true);
                }

                // Everything else should be included, that will be relative and absolute paths
                callback();
            }
        ];
    }

    /**
    * Devtool
    *
    * TODO
    * Consider tweaking this option & handle production correct
    * We want the source map files to be stored on a seperate server.
    */
    if (CLIENT && DEV) {
        buildConfig.devtool = 'cheap-module-inline-source-map';
    } else if (CLIENT && TEST) {
        buildConfig.devtool = 'inline-source-map';
    } else {
        buildConfig.devtool = 'source-map';
    }

    /**
    * Output
    */
    if (TEST) {
        buildConfig.output = {};
    } else {
        buildConfig.output = {
            path: outputPath,
            publicPath: DIST ? addTrailingSlash(settings.path) : getDevPath(),
            filename: (DIST && CLIENT) ? '[name].[hash].roc.js' : '[name].roc.js',
            chunkFilename: (DIST && CLIENT) ? '[name].[hash].roc.js' : '[name].roc.js'
        };
    }

    if (SERVER) {
        buildConfig.output.libraryTarget = 'commonjs2';
    }

    /**
    * Loaders
    */

    // Base
    buildConfig.module = {
        preLoaders: [],
        loaders: []
    };

    // ISPARTA LOADER
    if (TEST) {
        buildConfig.module.loaders.push({
            test: /\.js$/,
            loader: 'babel-loader',
            // FIXME
            include: [
                /tests/,
                /karma/
            ]
        });
        buildConfig.module.preLoaders.push({
            test: /\.js$/,
            loader: 'isparta-loader',
            // FIXME
            exclude: [
                /node_modules/,
                /tests/,
                /karma/,
                /src\/vendor/
            ]
        });
    }

    // JS LOADER
    const jsLoader = {
        test: /\.js$/,
        loader: 'babel-loader',
        include: function(absPath) {
            /* This function will look at the absolute path for the current file
             * to determine if it should be processed by babel-loader.
             *
             * What this does exactly is that it finds the last match of "roc-X/SOMETHING".
             * If SOMETHING is "node_modules" it will ignore it otherwise process it using
             * babel. Additionally if there is a match for node_modules in general after that
             * check it will ignore that as well.
             */
            const regexp = /(node_modules)|(roc-[^/]*)\/([^/]*)/g;
            let match, matches = [];
            while ((match = regexp.exec(absPath))) {
                matches.push({ roc: match[0], next: match[1] });
            }
            const last = matches[matches.length - 1];
            if (last && last.next !== 'node_modules') {
                // We want to process this with babel-loader.
                // This is something in a roc module.
                // Would like to avoid this, see issue https://github.com/webpack/webpack/issues/1071
                return true;
            } else if (!last) {
                // No match for node_modules, we will include this path.
                return true;
            }

            // We should come here in the case that there is a node_modules in the path
            return false;
        }
    };

    if (!TEST) {
        buildConfig.module.loaders.push(jsLoader);
    }

    const getScssLoader = (base = 'css-loader', modules = false) => {
        let moduleSettings = '';
        if (modules) {
            moduleSettings = '&module&localIdentName=';

            // Define how the class names should be defined
            if (DIST) {
                moduleSettings += '[hash:base64:5]';
            } else {
                moduleSettings += '[path]_[name]__[local]___[hash:base64:5]';
            }
        }

        return `${base}?sourceMap?importLoaders=2${moduleSettings}` +
        '!postcss!sass?sourceMap&' +
        'includePaths[]=' + bourbon + '&' +
        'includePaths[]=' + neat;
    };

    const flattenAssetsStyles = (input, regexp) => {
        return input.reduce((prev, curr) => {
            if (regexp.test(curr)) {
                return prev.concat(getAbsolutePath(curr));
            }
            return prev;
        }, []);
    };

    const scssStyles = flattenAssetsStyles(settings.assets, /\.scss$|\.css$/);

    // GLOBAL STYLE LOADER
    const globalStyleLoader = {
        test: (absPath) => {
            if (scssStyles.indexOf(absPath) !== -1) {
                return true;
            }
        },
        loader: ExtractTextPlugin.extract('style', getScssLoader())
    };

    // STYLE LOADER
    const styleLoader = {
        test: (absPath) => {
            if (scssStyles.indexOf(absPath) === -1 && /\.scss$|\.css$/.test(absPath)) {
                return true;
            }
        }
    };

    // JSON LOADER
    const jsonLoader = {
        test: /\.json$/,
        loader: 'json-loader'
    };

    let styleLoaders = 'css-loader';

    if (SERVER) {
        styleLoaders += '/locals';
    }

    styleLoaders = getScssLoader(styleLoaders, true);

    if (CLIENT) {
        styleLoaders = ExtractTextPlugin.extract('style', styleLoaders);
    }

    styleLoader.loader = styleLoaders;

    buildConfig.module.loaders.push(styleLoader);

    if (CLIENT) {
        buildConfig.module.loaders.push(globalStyleLoader);
    }

    // Post CSS buildConfig
    buildConfig.postcss = [
        autoprefixer({
            browsers: ['last 2 version']
        })
    ];

    // FILE LOADERS
    buildConfig.module.loaders.push({
        test: /\.(png|svg)$/,
        loader: 'url-loader?limit=100000'
    });

    buildConfig.module.loaders.push({
        test: /\.(jpg)$/,
        loader: 'file-loader'
    });

    buildConfig.module.loaders.push(jsonLoader);

    /**
    * Resolve
    */
    buildConfig.resolve = {
        fallback: [
            path.join(__dirname, '../../node_modules')
        ],
        extensions: ['', '.js', '.css', '.scss']
    };

    buildConfig.resolveLoader = {
        root: [
            path.join(process.cwd(), 'node_modules'),
            path.join(__dirname, '../../node_modules')
        ]
    };

    /**
    * Plugins
    */
    buildConfig.plugins = [];

    if (CLIENT) {
        buildConfig.plugins.push(
            new builder.IgnorePlugin(/^config$/)
        );
    }

    const styleName = COMPONENT_BUILD ? '[name].component.css' : '[name].[hash].css';

    buildConfig.plugins.push(
        new ExtractTextPlugin(styleName, {
            disable: CLIENT && DEV
        })
    );

    buildConfig.plugins.push(
        // process.env.NODE_ENV is used by React and some other libs to determine what to run
        new builder.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(ENV),
            '__DEV__': DEV,
            '__TEST__': TEST,
            '__DIST__': DIST,
            '__SERVER__': SERVER,
            '__CLIENT__': CLIENT,
            'ROC_SERVER_ENTRY': JSON.stringify(entry),
            'ROC_PATH_RESOLVER': JSON.stringify(resolver),
            // We need to do this since it effects the build
            'ROC_PATH': JSON.stringify(removeTrailingSlash(settings.path))
        })
    );

    if (DIST) {
        buildConfig.plugins.push(function() {
            this.plugin('done', writeStats);
        });
    }

    if (DEV && CLIENT) {
        buildConfig.plugins.push(
            new builder.optimize.OccurenceOrderPlugin(),
            new builder.HotModuleReplacementPlugin(),
            new builder.NoErrorsPlugin()
        );
    }

    if (DEV && SERVER) {
        buildConfig.plugins.push(
            new builder.NoErrorsPlugin()
        );
    }

    if (DIST) {
        buildConfig.plugins.push(
            new builder.optimize.DedupePlugin(),
            new builder.optimize.OccurenceOrderPlugin()
        );
    }

    if (DIST && CLIENT) {
        buildConfig.plugins.push(
            new builder.optimize.UglifyJsPlugin({
                /* eslint-disable */
                compress: {
                    warnings: false,
                    screw_ie8: true,
                    drop_debugger: true
                }
                /* eslint-enable */
            })
        );
    }

    if (COMPONENT_BUILD) {
        buildConfig.output.libraryTarget = 'umd';
        buildConfig.output.filename = '[name].component.js';
        buildConfig.entry = {
            app: [
                require.resolve('../../component/entry')
            ]
        };

        buildConfig.plugins.push(
            new builder.DefinePlugin({
                COMPONENT_ENTRY: JSON.stringify(entry),
                COMPONENT_STYLE: JSON.stringify(componentStyle)
            })
        );
    }

    // TODO Refactor this into a common helper
    const fileExists = (filepath) => {
        filepath = getAbsolutePath(filepath);
        try {
            return fs.statSync(filepath).isFile();
        } catch (error) {
            return false;
        }
    };

    const hasMiddlewares = !!(settings.koaMiddlewares && fileExists(settings.koaMiddlewares));

    if (hasMiddlewares) {
        const middlewares = getAbsolutePath(settings.koaMiddlewares);

        buildConfig.plugins.push(
            new builder.DefinePlugin({
                KOA_MIDDLEWARES: JSON.stringify(middlewares)
            })
        );
    }

    buildConfig.plugins.push(
        new builder.DefinePlugin({
            USE_DEFAULT_KOA_MIDDLEWARES: settings.useDefaultKoaMiddlewares,
            HAS_KOA_MIDDLEWARES: hasMiddlewares
        })
    );

    return {
        buildConfig,
        builder
    };
}
