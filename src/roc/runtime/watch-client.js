import 'source-map-support/register';

import debug from 'debug';
import koa from 'koa';
import koaWebpackDevMiddleware from 'koa-webpack-dev-middleware';
import koaWebpackHotMiddleware from 'koa-webpack-hot-middleware';

import { getDevPort } from '../helpers/dev';
import config from '../helpers/get-config';

debug.enable(config.dev.debug);

/**
 * Client watcher.
 *
 * @param {object} compiler - Webpack compiler instance.
 * @param {{devPort: number}} [options] - Options for the client watcher.
 * @returns {Promise} Resolves after it has completed.
 */
export default function watchClient(compiler, options = {}) {
    return new Promise((resolve, reject) => {
        if (!compiler) {
            return reject(new Error('A compiler instance must be passed in order to watch client!'));
        }

        let { devPort } = options;

        devPort = getDevPort(devPort);

        const server = koa();

        server.use(
            koaWebpackDevMiddleware(compiler, {
                publicPath: compiler.options.output.publicPath,
                noInfo: true,
                quiet: false,
                lazy: false
            })
        );

        server.use(
            koaWebpackHotMiddleware(compiler, {
                publicPath: compiler.options.output.publicPath,
                noInfo: false
            })
        );

        server.listen(devPort);
        debug('roc:dev:client')(`Dev server started on port ${devPort}`);

        resolve(server);
    });
}
