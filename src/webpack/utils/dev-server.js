/* eslint-disable strict */
'use strict';
/* eslint-enable */

const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const webpackConfig = require('../webpack.client');

const getDevPath = require('./get-dev-path').getDevPath();
const port = require('./get-dev-path').port;

new WebpackDevServer(webpack(webpackConfig), {
    publicPath: webpackConfig.output.publicPath,
    contentBase: getDevPath,
    noInfo: true,
    headers: {
        'Access-Control-Allow-Origin': '*'
    },
    hot: true
}).listen(port, '0.0.0.0', function callback(err) {
    if (err) {
        console.log(err);
    }

    console.log('The webpack-dev-server is running at ' + getDevPath);
});
