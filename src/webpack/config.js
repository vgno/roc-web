import { getDevPath } from './utils/dev';
import webpack from 'webpack';
import path from 'path';

import autoprefixer from 'autoprefixer';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import BrowserSyncPlugin from 'browser-sync-webpack-plugin';
import writeStats from './utils/write-stats';

const bourbon = './node_modules/bourbon/app/assets/stylesheets/';
const neat = './node_modules/bourbon-neat/app/assets/stylesheets/';

export default function createConfig(options) {
    const allowedModes = ['dev', 'test', 'dist'];
    const allowedTargets = ['node', 'browser'];

    if (allowedModes.indexOf(options.mode) === -1) {
        throw new Error(`Invalid mode, must be one of ${allowedModes}. Was instead ${options.mode}`);
    }

    if (allowedTargets.indexOf(options.target) === -1) {
        throw new Error(`Invalid target, must be one of ${allowedTargets}. Was instead ${options.target}`);
    }

    if (!options.buildPath) {
        throw new Error('A build path needs to be defined in the options.');
    }

    const DEV = (options.mode === 'dev');
    const TEST = (options.mode === 'test');
    const DIST = (options.mode === 'dist');

    const NODE = (options.target === 'node');
    const BROWSER = (options.target === 'browser');

    const ENV = DIST ? 'production' : 'development';

    let webpackConfig = {};

    /**
    * Target
    */
    let buildSubdir = 'client';

    if (NODE) {
        webpackConfig.target = 'node';
        buildSubdir = 'server';
    }

    const devPath = getDevPath({
        buildPath: options.buildPath
    });

    let completeBuildPath = path.join(options.buildPath.absolute, buildSubdir);

    if (NODE) {
        webpackConfig.externals = [
            /^[a-zA-Z\-0-9/]+$/
        ];
    }

    /**
    * Devtool
    *
    * TODO: Consider tweaking this option & handle production correct
    * We want the source map files to be stored on a seperate server.
    */
    if (BROWSER && DEV) {
        webpackConfig.devtool = 'cheap-module-inline-source-map';
    } else if (BROWSER && TEST) {
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
            path: completeBuildPath,
            publicPath: DIST ? '/' : devPath,
            filename: (DIST && BROWSER) ? '[name].[hash].js' : '[name].bundle.js',
            chunkFilename: (DIST && BROWSER) ? '[name].[hash].js' : '[name].bundle.js'
        };
    }

    if (NODE) {
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
        // FIXME
        exclude: [
            /node_modules/,
            /src\/vendor/
        ]
    };

    if (!TEST) {
        webpackConfig.module.loaders.push(jsLoader);
    }

    // STYLE LOADER
    const styleLoader = {
        test: /\.scss$/
    };

    let styleLoaders = 'css?sourceMap&module&importLoaders=1&localIdentName=';

    // Define how the class names should be defined
    if (DIST) {
        styleLoaders += '[hash:base64:5]';
    } else {
        styleLoaders += '[name]__[local]___[hash:base64:5]';
    }

    // We can add an external sass dependecie here.
    styleLoaders += '!postcss!sass?sourceMap&' +
    'includePaths[]=' + bourbon + '&' +
    'includePaths[]=' + neat;

    styleLoaders = ExtractTextPlugin.extract('style', styleLoaders);

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

    /**
    * Resolve
    */
    webpackConfig.resolve = {
        fallback: [
            path.join(__dirname, '../../node_modules')
        ],
        extensions: ['', '.js']
    };

    webpackConfig.resolveLoader = {
        root: [
            path.join(completeBuildPath, '../../node_modules'),
            path.join(__dirname, '../../node_modules')
        ]
    };

    /**
    * Plugins
    */
    webpackConfig.plugins = [];

    if (NODE) {
        webpackConfig.plugins.push(
            new webpack.BannerPlugin(
                'require("source-map-support").install();',
                {
                    raw: true,
                    entryOnly: false
                }
            )
        );
    }

    if (BROWSER) {
        webpackConfig.plugins.push(
            new webpack.IgnorePlugin(/^config$/)
            //new webpack.IgnorePlugin(/^\.\/server$/)
        );
    }

    webpackConfig.plugins.push(
        new ExtractTextPlugin('[name].[hash].css', {
            disable: BROWSER && DEV
        })
    );

    webpackConfig.plugins.push(
        // process.env.NODE_ENV is used by React and some other libs to determine what to run
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(ENV),
            '__DEV__': DEV,
            '__TEST__': TEST,
            '__DIST__': DIST,
            '__SERVER__': NODE
        })
    );

    if (DIST) {
        webpackConfig.plugins.push(function() {
            this.plugin('done', writeStats);
        });
    }

    if (DEV && BROWSER) {
        webpackConfig.plugins.push(
            new webpack.HotModuleReplacementPlugin()
        );
    }

    if (DIST) {
        webpackConfig.plugins.push(
            new webpack.optimize.DedupePlugin(),
            new webpack.optimize.OccurenceOrderPlugin()
        );
    }

    if (DIST && BROWSER) {
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

    // FIXME
    if (BROWSER && DEV && !TEST) {
        webpackConfig.plugins.push(
            new BrowserSyncPlugin({
                host: 'localhost',
                port: 3000,
                logFileChanges: false
            }, {
                reload: false
            })
        );
    }

    return webpackConfig;
}
