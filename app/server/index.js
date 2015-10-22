import debug from 'debug';
import koa from 'koa';
import helmet from 'koa-helmet';
import serve from 'koa-static';

export function createServer(options = {}) {
    const server = koa();

    // Security headers
    server.use(helmet());
    server.use(require('koa-etag')());
    server.use(require('koa-compressor')());
    server.use(require('koa-favicon')('./static/favicon.png'));
    server.use(require('koa-accesslog')());

    server.use(serve('./static'));

    if (options.path) {
        const paths = [].concat(options.path);
        for (const path of paths) {
            server.use(serve(path));
        }
    }

    return server;
}

export function startServer(server, port = 3000) {
    server.listen(port);
    debug('roc')(`Server started on port ${port}`);
}
