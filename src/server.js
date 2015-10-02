import debug from 'debug';
import koa from 'koa';
import helmet from 'koa-helmet';
import serve from 'koa-static';

export default function createServer(options = {}) {
    const server = koa();

    // Security headers
    server.use(helmet());
    server.use(require('koa-etag')());
    server.use(require('koa-compressor')());
    server.use(require('koa-favicon')('./static/favicon.png'));
    server.use(require('koa-accesslog')());

    server.use(serve('./static'));

    if (options.path) {
        const paths = (Array.isArray(options.path) ? options.path : [options.path]);
        for (let path of paths) {
            server.use(serve(path));
        }
    }

    return server;
}

export function startServer(server, port = 3000) {
    debug.enable('app');
    server.listen(port);
    debug('app')(`Server started on port ${port}`);
}

