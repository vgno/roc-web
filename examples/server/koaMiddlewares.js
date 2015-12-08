import hello from 'koa-hello-world';

export default function middlewares(/* config */) {
    return [hello()];
}
