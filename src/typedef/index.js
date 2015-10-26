/**
 * Roc build config.
 *
 * @typedef {Object} rocBuildConfig
 * @property {!string} mode - Which mode it should be built for, either `dev`, `test` or `dist`.
 * @property {!string} target - The target for the build, either `server` or `client`.
 * @property {!outputPath} outputPath - Where the build should be saved.
 * @property {!string} entry - Entry file for the build.
 * @property {number} [port] - The port that the server will be started on, need to match for Browsersync to work. This
 * is not used to start the actuall application. Uses the same logic as for {@link startServer}.
 * @property {number} [devPort] - The port to start the dev server on.
 * @property {boolean} [moduleBuild] - If building a module.
 * @property {string} [module] - Entry file for a module, only needed if building a module and `moduleBuild` is true.
 * @property {string} [moduleStyle] - Default styles for a module, only needed if building a module and `moduleBuild`
  is true.
 */

/**
 * Roc builder object.
 *
 * @typedef {Object} rocBuilder
 * @property {object} config - Webpack config object, can be used to extend the configuration.
 * @property {object} build - Webpack instance.
 * @see https://webpack.github.io/
 */

/**
 * Output path object.
 *
 * @typedef {Object} outputPath
 * @property {!string} absolute - Absolute path to where the build should be saved on disk.
 * @property {!string} relative - Relative path to where the build should be saved on disk, based on from where the
 * command is run from.
 */

/**
 * Roc server.
 *
 * @typedef {Object} rocServer
 * @property {object} server - Koa instance.
 * @property {startServer} start - Starts the server.
 */

 /**
 * Starts a server.
 *
 * The port for the server to start on can be selected in 3 ways and has priority in the same order.
 * 1. The param for the function, `port`
 * 2. Environment variable, `PORT`
 * 3. The port from `roc.config.js`
 *
 * @typedef {function} startServer
 * @param {number} [port=PORT/roc.config.js] - the port to start the server on.
 */

/**
 * Roc server options.
 *
 * Used in {@link createConfig}.
 *
 * Both of this options can also be set in `roc.config.js` however these values will override them if provided.
 *
 * @typedef {Object} rocServerOptions
 * @property {string|string[]} [serve] - The folders to serve from the server. Paths should be based from where the
 * application is started.
 * @property {string} [favicon] - The path to the favicon. This file will be handeled in the server in a special way.
 */
