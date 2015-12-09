/* global __DIST__ */

import helmet from 'koa-helmet';
import koaEtag from 'koa-etag';
import koaCompressor from 'koa-compressor';
import koaFavicon from 'koa-favicon';
import koaAccesslog from 'koa-accesslog';
import koaLogger from 'koa-logger';

export default function middlewares(config) {
    const middlewaresList = [];

    // Security headers
    middlewaresList.push(helmet());

    middlewaresList.push(koaEtag());

    // We only enable gzip in dist
    if (__DIST__) {
        middlewaresList.push(koaCompressor());
    }

    const favicon = config.favicon;
    if (favicon) {
        middlewaresList.push(koaFavicon(favicon));
    }

    if (__DIST__) {
        middlewaresList.push(koaAccesslog());
    } else {
        middlewaresList.push(koaLogger());
    }

    return middlewaresList;
}
