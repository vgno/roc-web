import 'source-map-support/register';

import debug from 'debug';
import koa from 'koa';
import koaWebpackDevMiddleware from 'koa-webpack-dev-middleware';
import koaWebpackHotMiddleware from 'koa-webpack-hot-middleware';

import { getDevPort } from '../helpers/general';
import { getConfig } from '../helpers/config';

/**
 * Client watcher.
 *
 * @param {object} compiler - Webpack compiler instance.
 * @returns {Promise} Resolves after it has completed.
 */
export default function watchClient(compiler) {
    const config = getConfig();
    debug.enable(config.dev.debug);

    return new Promise((resolve, reject) => {
        if (!compiler) {
            return reject(new Error('A compiler instance must be passed in order to watch client!'));
        }
        const devPort = getDevPort();

        const server = koa();

        server.use(
            koaWebpackDevMiddleware(compiler, {
                publicPath: compiler.options.output.publicPath,
                noInfo: config.dev.devMiddleware.noInfo,
                quiet: config.dev.devMiddleware.quiet
            })
        );

        server.use(
            koaWebpackHotMiddleware(compiler, {
                reload: config.dev.hotMiddleware.reload,
                noInfo: config.dev.hotMiddleware.noInfo,
                quiet: config.dev.hotMiddleware.quiet
            })
        );

        server.listen(devPort);
        debug('roc:dev:client')(`Dev server started on port ${devPort}`);

        resolve(server);
    });
}
