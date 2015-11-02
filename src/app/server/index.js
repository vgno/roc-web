/* global __DIST__ */

import debug from 'debug';
import koa from 'koa';
import helmet from 'koa-helmet';
import serve from 'koa-static';
import koaEtag from 'koa-etag';
import koaCompressor from 'koa-compressor';
import koaFavicon from 'koa-favicon';
import koaAccesslog from 'koa-accesslog';
import koaLogger from 'koa-logger';

const config = require('roc-web/lib/helpers/get-config');

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

    // Security headers
    server.use(helmet());

    server.use(koaEtag());
    server.use(koaCompressor());

    const favicon = options.favicon || config.favicon;
    if (favicon) {
        server.use(koaFavicon(favicon));
    }

    if (__DIST__) {
        server.use(koaAccesslog());
    } else {
        server.use(koaLogger());
    }

    const makeServe = (toServe = []) => {
        toServe = [].concat(toServe);
        for (const path of toServe) {
            server.use(serve(path));
        }
    };

    // Serve folders
    makeServe(options.serve || config.serve);

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
