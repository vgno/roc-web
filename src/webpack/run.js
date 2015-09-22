import webpack from 'webpack';

//import clearFolder from './utils/clear-folder';

export default function build(webpackConfig) {
    //clearFolder(webpackConfig.output.path);

    webpack(webpackConfig, function(err, stats) {
        console.log(err, stats);
    });
}

export function startDev(webpackConfig) {
    const WebpackDevServer = require('webpack-dev-server');
    const getDevPath = require('./utils/get-dev-path').getDevPath();
    const port = require('./utils/get-dev-path').getDevPort();

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
}
