import 'source-map-support/register';

import webpack from 'webpack';
import path from 'path';
import autoprefixer from 'autoprefixer';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import { validate } from 'roc-config';

import { getConfig, metaConfig } from '../helpers/config';
import { getDevPath, getAbsolutePath } from '../helpers/general';
import { writeStats } from './utils/stats';

const bourbon = './node_modules/bourbon/app/assets/stylesheets/';
const neat = './node_modules/bourbon-neat/app/assets/stylesheets/';

/**
 * Creates a builder.
 *
 * @param {!string} target - a target: should be either "client" or "server"
 * @param {!string} [resolver=roc-web/lib/helpers/get-resolve-path] - Path to the resolver for the server side
 * {@link getResolvePath}
 * @returns {rocBuilder}
 */
export default function createBuilder(target, resolver = 'roc-web/lib/helpers/get-resolve-path') {
    const allowedTargets = ['server', 'client'];

    if (allowedTargets.indexOf(target) === -1) {
        throw new Error(`Invalid target, must be one of ${allowedTargets}. Was instead ${target}.`);
    }

    const config = getConfig();
    validate(config, metaConfig);

    const DEV = (config.build.mode === 'dev');
    const TEST = (config.build.mode === 'test');
    const DIST = (config.build.mode === 'dist');

    const SERVER = (target === 'server');
    const CLIENT = (target === 'client');

    const COMPONENT_BUILD = !!config.build.moduleBuild;

    const ENV = DIST ? 'production' : 'development';

    const entry = getAbsolutePath(config.build.entry[target]);
    const outputPath = getAbsolutePath(config.build.outputPath[target]);
    const componentStyle = getAbsolutePath(config.build.moduleStyle);

    let webpackConfig = {};

    if (DIST) {
        webpackConfig.bail = true;
    }

    /**
    * Entry
    */
    if (SERVER) {
        webpackConfig.entry = {
            [config.build.outputName]: [
                require.resolve('../../src/app/server-entry')
            ]
        };
    } else if (TEST) {
        webpackConfig.entry = {};
    } else if (CLIENT && DEV) {
        webpackConfig.entry = {
            [config.build.outputName]: [
                `webpack-hot-middleware/client?path=${getDevPath()}__webpack_hmr`,
                entry
            ]
        };
    } else if (CLIENT) {
        webpackConfig.entry = {
            [config.build.outputName]: [
                entry
            ]
        };
    }

    /**
    * Target
    */
    if (SERVER) {
        webpackConfig.target = 'node';
    }

    if (SERVER) {
        webpackConfig.externals = [
            {
                [resolver]: true,
                ['roc-web/lib/helpers/config']: true
            },
            function(context, request, callback) {
                // If a roc module include it in the bundle
                if (request.substr(0, 4) === 'roc-') {
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
        webpackConfig.devtool = 'cheap-module-inline-source-map';
    } else if (CLIENT && TEST) {
        webpackConfig.devtool = 'inline-source-map';
    } else {
        webpackConfig.devtool = 'source-map';
    }

    /**
    * Output
    */
    if (TEST) {
        webpackConfig.output = {};
    } else {
        webpackConfig.output = {
            path: outputPath,
            publicPath: DIST ? config.path : getDevPath(),
            filename: (DIST && CLIENT) ? '[name].[hash].roc.js' : '[name].roc.js',
            chunkFilename: (DIST && CLIENT) ? '[name].[hash].roc.js' : '[name].roc.js'
        };
    }

    if (SERVER) {
        webpackConfig.output.libraryTarget = 'commonjs2';
    }

    /**
    * Loaders
    */

    // Base
    webpackConfig.module = {
        preLoaders: [],
        loaders: []
    };

    // ISPARTA LOADER
    if (TEST) {
        webpackConfig.module.loaders.push({
            test: /\.js$/,
            loader: 'babel-loader',
            // FIXME
            include: [
                /tests/,
                /karma/
            ]
        });
        webpackConfig.module.preLoaders.push({
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
        webpackConfig.module.loaders.push(jsLoader);
    }

    // STYLE LOADER
    const styleLoader = {
        test: /\.scss$/
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

    styleLoaders += '?sourceMap&module&importLoaders=1&localIdentName=';

    // Define how the class names should be defined
    if (DIST) {
        styleLoaders += '[hash:base64:5]';
    } else {
        styleLoaders += '[path]_[name]__[local]___[hash:base64:5]';
    }

    // We can add an external sass dependecie here.
    styleLoaders += '!postcss!sass?sourceMap&' +
    'includePaths[]=' + bourbon + '&' +
    'includePaths[]=' + neat;

    if (CLIENT) {
        styleLoaders = ExtractTextPlugin.extract('style', styleLoaders);
    }

    styleLoader.loader = styleLoaders;

    webpackConfig.module.loaders.push(styleLoader);

    // Post CSS webpackConfig
    webpackConfig.postcss = [
        autoprefixer({
            browsers: ['last 2 version']
        })
    ];

    // FILE LOADERS
    webpackConfig.module.loaders.push({
        test: /\.(png|svg)$/,
        loader: 'url-loader?limit=100000'
    });

    webpackConfig.module.loaders.push({
        test: /\.(jpg)$/,
        loader: 'file-loader'
    });

    webpackConfig.module.loaders.push(jsonLoader);

    /**
    * Resolve
    */
    webpackConfig.resolve = {
        fallback: [
            path.join(__dirname, '../../node_modules')
        ],
        extensions: ['', '.js', '.css', '.scss']
    };

    webpackConfig.resolveLoader = {
        root: [
            path.join(process.cwd(), 'node_modules'),
            path.join(__dirname, '../../node_modules')
        ]
    };

    /**
    * Plugins
    */
    webpackConfig.plugins = [];

    if (CLIENT) {
        webpackConfig.plugins.push(
            new webpack.IgnorePlugin(/^config$/)
        );
    }

    const styleName = COMPONENT_BUILD ? '[name].component.css' : '[name].[hash].css';

    webpackConfig.plugins.push(
        new ExtractTextPlugin(styleName, {
            disable: CLIENT && DEV
        })
    );

    webpackConfig.plugins.push(
        // process.env.NODE_ENV is used by React and some other libs to determine what to run
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(ENV),
            '__DEV__': DEV,
            '__TEST__': TEST,
            '__DIST__': DIST,
            '__SERVER__': SERVER,
            '__CLIENT__': CLIENT,
            'ROC_SERVER_ENTRY': JSON.stringify(entry),
            'ROC_PATH_RESOLVER': JSON.stringify(resolver)
        })
    );

    if (DIST) {
        webpackConfig.plugins.push(function() {
            this.plugin('done', writeStats);
        });
    }

    if (DEV && CLIENT) {
        webpackConfig.plugins.push(
            new webpack.optimize.OccurenceOrderPlugin(),
            new webpack.HotModuleReplacementPlugin(),
            new webpack.NoErrorsPlugin()
        );
    }

    if (DEV && SERVER) {
        webpackConfig.plugins.push(
            new webpack.NoErrorsPlugin()
        );
    }

    if (DIST) {
        webpackConfig.plugins.push(
            new webpack.optimize.DedupePlugin(),
            new webpack.optimize.OccurenceOrderPlugin()
        );
    }

    if (DIST && CLIENT) {
        webpackConfig.plugins.push(
            new webpack.optimize.UglifyJsPlugin({
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
        webpackConfig.output.libraryTarget = 'umd';
        webpackConfig.output.filename = '[name].component.js';
        webpackConfig.entry = {
            app: [
                require.resolve('../../component/entry')
            ]
        };

        webpackConfig.plugins.push(
            new webpack.DefinePlugin({
                COMPONENT_ENTRY: JSON.stringify(entry),
                COMPONENT_STYLE: JSON.stringify(componentStyle)
            })
        );
    }

    return {
        buildConfig: webpackConfig,
        builder: webpack
    };
}
