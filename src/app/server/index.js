/* global USE_DEFAULT_KOA_MIDDLEWARES HAS_KOA_MIDDLEWARES KOA_MIDDLEWARES  */

import debug from 'debug';
import koa from 'koa';
import serve from 'koa-static';

import { merge } from 'roc-config';

const getConfig = require('roc-web/lib/helpers/config').getConfig;

/**
 * Creates a server instance.
 *
 * @example
 * import { createServer } from 'roc-web/app';
 *
 * const server = createServer({
 *    serve: 'static',
 *    favicon: 'static/favicon.png'
 * });
 * server.start();
 *
 * @param {rocServerOptions} options - Options for the server. Will override configuration in roc.config.js.
 * @returns {rocServer} server - Roc server instace.
 */
export default function createServer(options = {}) {
    const server = koa();
    const config = merge(getConfig(), options);

    if (USE_DEFAULT_KOA_MIDDLEWARES) {
        const middlewares = require('./middlewares')(config);
        middlewares.forEach((middleware) => server.use(middleware));
    }

    if (HAS_KOA_MIDDLEWARES) {
        const middlewares = require(KOA_MIDDLEWARES)(config);
        middlewares.forEach((middleware) => server.use(middleware));
    }

    const makeServe = (toServe = []) => {
        toServe = [].concat(toServe);
        for (const path of toServe) {
            server.use(serve(path));
        }
    };

    // Serve folders
    makeServe(config.serve);

    function start(port) {
        port = port || process.env.PORT || config.port;
        server.listen(port);

        if (process.send) {
            process.send('online');
        }

        debug('roc:server')(`Server started on port ${port}`);
    }

    return {
        server,
        start
    };
}
