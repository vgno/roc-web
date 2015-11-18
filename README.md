# roc-web

Base extension for web applications built with Roc. Uses mainly __Koa__ and __Webpack__ internally.

## Examples
There is some examples in `examples/` that shows how `roc-web` can be used directly. To test them out you will need to run `npm link` to connect them to your checked out version of `roc-web`.

1. Run `npm install` in the base of `roc-web`.
2. Run `npm build` in the base of `roc-web`.
3. Run `npm link` in the base of `roc-web`.
4. Go to the example you want and run `npm link roc-web`.
5. Using the `roc-cli` run `roc dev` to get started. Some example may need some extra parameters set to `roc-dev`

## Tips

### Restart Server in Dev Mode
You can restart the server when running the application in development mode by typing `rs` in the terminal window and hitting enter.

## Build an application
When creating an application based on __roc-web__ you use `createServer` API. It returns an object that has a start method on it that can be invoked to run the application.

### Simple Example
```javascript
import { createServer } from 'roc-web/app';

const server = createServer({
    serve: 'static',
    favicon: 'static/favicon.png'
});

server.start();
```

The application can be configured through the use of a `roc.config.js` file as well as passing options in the API functions. Please look at the JSDoc for the complete interface.

### roc.config.js
`roc.config.js` is a powerful way to configure a Roc project. You can use it to override default configuration and also extend or override the builder used to create the application.

#### Configuration
By default all Roc extensions can add configuration options that will be used throughout their internal code. Most often they also define sane defaults for this configuration. In some cases one will want to fine tune them or in other cases it's expected that the user **must** provide something. This can be done by providing a `config` object from the `roc.config.js` file that matches the required options in the extension.

The best way currently to see what options are available in an extension is to look at the `roc.config.js` file that contains the defaults and it's associated `roc.config.meta.js` containing descriptions on what the different options do. Both of these files can be found in `src/roc/config`. It is also possible to use the Roc CLI to list the available options, their defaults and descriptions. You do this by running either `$ roc dev --help` or `$ roc build --help`.

__Example configuration__
```js
modules.exports = {
    config: {
        port: 80
    }
};
```

#### Builder
It is possible to override and extend the builder implemented in a Roc extension that is used by the Roc CLI. This could be useful for adding some extra logic to the build or manually merging two Roc extensions together.

To do this you will need to define a `createBuilder` function that is exported from `roc.config.js`. This should follow the same interface as normal, please see the documentation for this.

__Example__
```js
const rocWebBuilder = require('roc-web').createBuilder;
modules.exports = {
    createBuilder: function(target) {
        const { buildConfig, builder } = rocWebBuilder(target);

        // Extend the buildConfig in some way if needed
        // …

        return {
            buildConfig,
            builder
        };
    }
};
```

### Important
* The code will be bundled with Webpack and so `__dirname` will not work for example.
* The paths given above to `serve` and `favicon` will be evaluated from where you start the application and the folder name itself will not be needed in the URL. Like in the above example the path to the `favicon.png` would be `http://host/favicon.png`

### Exposes
When creating an application based on __roc-web__ one can use the node dependencies used in this project. This means that you can import them as you would do if you had installed them inside your application.

##### Some of what is available
* debug
* config
    * Will look for configuration files inside a `/config` folder from where the application is started. Please look at the complete documentation here https://github.com/lorenwest/node-config/.

_For a complete list look at the `package.json` in the root of this project._

## Extend
To create an roc extension on top of __roc-web__ one needs to extend the API. More information will be added here but for now one can look at the ESDocs.
