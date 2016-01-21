/* global USE_DEFAULT_KOA_MIDDLEWARES HAS_KOA_MIDDLEWARES KOA_MIDDLEWARES ROC_PATH  */

import debug from 'debug';
import koa from 'koa';
import serve from 'koa-static';
import mount from 'koa-mount';

import addTrailingSlash from 'koa-add-trailing-slashes';
import normalizePath from 'koa-normalize-path';
import lowercasePath from 'koa-lowercase-path';
import removeTrailingSlash from 'koa-remove-trailing-slashes';

import { merge, getSettings } from 'roc';

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
 *
 * server.start();
 *
 * @param {rocServerOptions} options - Options for the server. Will override configuration in roc.config.js.
 * @param {Function[]} beforeUserMiddlewares - Middlewares that should be added before the user middlewares.
 * @returns {rocServer} server - Roc server instace.
 */
export default function createServer(options = {}, beforeUserMiddlewares = []) {
    const server = koa();
    const settings = merge(getSettings('runtime'), options);

    if (USE_DEFAULT_KOA_MIDDLEWARES) {
        const middlewares = require('./middlewares')(settings);
        middlewares.forEach((middleware) => server.use(middleware));
    }

    if (beforeUserMiddlewares.length) {
        beforeUserMiddlewares.forEach((middleware) => server.use(middleware));
    }

    if (HAS_KOA_MIDDLEWARES) {
        const middlewares = require(KOA_MIDDLEWARES)(settings);
        middlewares.forEach((middleware) => server.use(middleware));
    }

    const makeServe = (toServe = []) => {
        toServe = [].concat(toServe);
        for (const path of toServe) {
            // We use defer here to no try to fetch a file if we have set something on body, something that is done in
            // redirect. This because https://github.com/koajs/send/issues/51
            server.use(serve(path, { defer: true }));
        }
    };

    if (settings.koa.normalize.enabled) {
        server.use(normalizePath({ defer: settings.koa.normalize.defer }));
    }

    if (settings.koa.lowercase.enabled) {
        server.use(lowercasePath({ defer: settings.koa.lowercase.defer }));
    }

    if (settings.koa.trailingSlashes.enabled === true) {
        server.use(addTrailingSlash({ defer: settings.koa.trailingSlashes.defer }));
    } else if (settings.koa.trailingSlashes.enabled === false) {
        server.use(removeTrailingSlash());
    }

    // Serve folders
    makeServe(settings.serve);

    function start(port) {
        port = port || process.env.PORT || settings.port;

        const app = koa();
        app.use(mount(ROC_PATH, server));
        app.listen(port);

        if (process.send) {
            process.send('online');
        }

        debug('roc:server')(`Server started on port ${port} and served from ${ROC_PATH}`);
    }

    return {
        server,
        start
    };
}
