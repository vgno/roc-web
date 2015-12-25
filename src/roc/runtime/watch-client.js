import 'source-map-support/register';

import debug from 'debug';
import koa from 'koa';
import koaWebpackDevMiddleware from 'koa-webpack-dev-middleware';
import koaWebpackHotMiddleware from 'koa-webpack-hot-middleware';
import { getSettings } from 'roc-config';

import { getDevPort } from '../helpers/general';

/**
 * Client watcher.
 *
 * @param {object} compiler - Webpack compiler instance.
 * @returns {Promise} Resolves after it has completed.
 */
export default function watchClient(compiler) {
    const settings = getSettings('dev');
    debug.enable(settings.debug);

    return new Promise((resolve, reject) => {
        if (!compiler) {
            return reject(new Error('A compiler instance must be passed in order to watch client!'));
        }
        const devPort = getDevPort();

        const server = koa();

        server.use(
            koaWebpackDevMiddleware(compiler, {
                // Let the publicPath be / since we want it to be based on the root of the dev server
                publicPath: '/',
                noInfo: settings.devMiddleware.noInfo,
                quiet: settings.devMiddleware.quiet
            })
        );

        server.use(
            koaWebpackHotMiddleware(compiler, {
                reload: settings.hotMiddleware.reload,
                noInfo: settings.hotMiddleware.noInfo,
                quiet: settings.hotMiddleware.quiet
            })
        );

        server.listen(devPort);
        debug('roc:dev:client')(`Dev server started on port ${devPort}`);

        resolve(server);
    });
}
