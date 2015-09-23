import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
import { getDevPath, getDevPort } from './utils/dev';

export default function startDev(webpackConfig) {
    const path = getDevPath();
    const port = getDevPort();

    new WebpackDevServer(webpack(webpackConfig), {
        publicPath: webpackConfig.output.publicPath,
        contentBase: path,
        noInfo: true,
        headers: {
            'Access-Control-Allow-Origin': '*'
        },
        hot: true
    }).listen(port, '0.0.0.0', function callback(err) {
        if (err) {
            console.log(err);
        }

        console.log('The webpack-dev-server is running at ' + path);
    });
}

