/*eslint-disable */
'use strict';
/*eslint-enable */

const webpack = require('webpack');

const bourbon = './node_modules/bourbon/app/assets/stylesheets/';
const neat = './node_modules/bourbon-neat/app/assets/stylesheets/';

const autoprefixer = require('autoprefixer');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const BrowserSyncPlugin = require('browser-sync-webpack-plugin');

const writeStats = require('./utils/write-stats');
// const getDevPath = require('./utils/get-dev-path').getDevPath();
const getDevPath = '';

module.exports = function createWebpackConfig(options) {
    const allowedModes = ['dev', 'test', 'dist'];
    const allowedTargets = ['node', 'browser'];

    if (allowedModes.indexOf(options.mode) === -1) {
        throw new Error(`Invalid mode, must be one of ${allowedModes}. Was instead ${options.mode}`);
    }

    if (allowedTargets.indexOf(options.target) === -1) {
        throw new Error(`Invalid mode, must be one of ${allowedTargets}. Was instead ${options.target}`);
    }

    if (!options.buildDir) {
        throw new Error('A build directory needs to be defined in the options.');
    }

    const DEV = (options.mode === 'dev');
    const TEST = (options.mode === 'test');
    const DIST = (options.mode === 'dist');

    const NODE = (options.target === 'node');
    const BROWSER = (options.target === 'browser');

    const ENV = DIST ? 'production' : 'development';

    let webpackConfig = {};

    if (NODE) {
        webpackConfig.externals = /^[a-zA-Z\-0-9/]+$/;
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
    * Target
    */
    if (NODE) {
        webpackConfig.target = 'node';
    }

    /**
    * Output
    */
    if (TEST) {
        webpackConfig.output = {};
    } else {
        webpackConfig.output = {
            path: options.buildDir.absolute,
            publicPath: DIST ? '/' : getDevPath + '/' + options.buildDir.relative + '/',
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
            loader: 'babel',
            // FIXME
            include: [
                /tests/,
                /karma/
            ]
        });
        webpackConfig.module.preLoaders.push({
            test: /\.js$/,
            loader: 'isparta',
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
        loader: 'babel',
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
        loader: 'url?limit=100000'
    });

    webpackConfig.module.loaders.push({
        test: /\.(jpg)$/,
        loader: 'file'
    });

    /**
    * Resolve
    */
    webpackConfig.resolve = {
        extensions: ['', '.js']
    };

    /**
    * Plugins
    */
    webpackConfig.plugins = [

        new ExtractTextPlugin('[name].[hash].css', {
            disable: BROWSER && DEV
        }),

        // process.env.NODE_ENV is used by React and some other libs to determin what to run
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(ENV),
            '__DEV__': DEV,
            '__TEST__': TEST,
            '__DIST__': DIST,
            '__SERVER__': NODE
        })
    ];

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

    if (NODE && false) {
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

    /*
    FIXME

    webpackConfig.resolveLoader = { root: [
        ...
    ] };
    webpackConfig.resolve = { fallback: [
        ...
    ] };
    */
    return webpackConfig;
};
