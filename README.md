# roc-web

Base extension for web applications built with Roc. Uses mainly __Koa__ and __Webpack__ internally.

## Examples
There is some examples in `examples/` that shows how `roc-web` can be used directly. To test them out you will need to run `npm link`.

1. Run `npm install` in the base of `roc-web`.
2. Run `npm build` in the base of `roc-web`.
3. Run `npm link` in the base of `roc-web`.
4. Go to the example you want and run `npm link roc-web`.
5. Using the `roc-cli` run `roc run dev` to get started.

## Build an application
When creating an application based on __roc-web__ you use `createServer`. It returns an object that has a start method on it that can be invoked to run the application.

### Simple Example
```javascript
import { createServer } from 'roc-web/app';

const server = createServer({
    serve: 'static',
    favicon: 'static/favicon.png'
});

server.start();
```

The application can be configured through the use of a `roc.config.js` file as well as setting options in the functions. Please look at the JSDoc for the complete interface.

### roc.config.js
This is the default configuration that will be used if not overridden as either options in functions, like above, or creating a `roc.config.js` from where the application is started, the application root.
```javascript
export default {
    // Port for the server to use.
    port: 3000,
    debug: {
        // The level of debug messages that should be shown for the server, see https://www.npmjs.com/package/debug
        server: 'roc:*'
    },
    // What folder the server should expose.
    serve: [],
    // Path to the favicon file, specially handled on the server.
    favicon: '',

    dev: {
        // The level of debug messages that should be shown, see https://www.npmjs.com/package/debug
        debug: 'roc:*',
        // Port for the dev server, will need to be a free range of at least 3.
        port: 3001,
        // Files/folders that should trigger a restart of the server.
        watch: [
            'config/',
            'roc.config.js'
        ],
        // If Browsersync should reload the browser when the server is rebuilt.
        reloadOnServerChange: false,
        // If Browsersync should open the server when it has started
        open: false
    }
};
```

### Important
* To note here is that the code will be bundled with Webpack and `__dirname` will not work for example.
* The paths given above to `serve` and `favicon` is based on where you start the application from and the folder name itself will not be needed. Like in the above example the path to the `favicon.png` would be the root of the server.

### Exposes
When creating an application based on __roc-web__ one can use the dependencies used in this project. This means that you can import them as you would do if you had installed them inside your application.

##### Some of what is available
* debug
* config
    * Will look for configuration files inside a `/config` folder from where the application is started. Please look at the complete documentation here https://github.com/lorenwest/node-config/.

_For a complete list look at the `package.json` in the root of this project._

## Extend
To create an roc extension on top of __roc-web__ one needs to extend the API.

_More to be added here…_
