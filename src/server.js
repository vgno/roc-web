import debug from 'debug';
import koa from 'koa';
import helmet from 'koa-helmet';
import serve from 'koa-static';
import path from 'path';

export default function createServer(options = {}) {
    const server = koa();

    // Security headers
    server.use(helmet());
    server.use(require('koa-etag')());
    server.use(require('koa-compressor')());
    server.use(require('koa-favicon')('./static/favicon.png'));
    server.use(require('koa-accesslog')());

    server.use(serve('./static'));

    if (!options.path) {
        server.use(serve(path.join(__dirname, './views')));
    } else {
        server.use(serve(options.path));
    }

    return server;
}

export function startServer(server, port = 3000) {
    debug.enable('app');
    server.listen(port);
    debug('app')(`Server started on port ${port}`);
}

