import 'source-map-support/register';

import path from 'path';
import deepAssign from 'deep-assign';

const baseConfig = require('../default/roc.config.js');

let appConfig = {};
try {
    appConfig = require(path.join(process.cwd(), 'roc.config.js'));
} catch (error) {
    // Do nothing, just use the base config
}

const config = deepAssign(baseConfig, appConfig);

/**
 * Exports the merged `roc.config.js`.
 *
 * Merges the application configuration along with the default, see the `README.md` or the source for the default
 * `roc.config.js` file.
 *
 * @return {object} config - The merged `roc.config.js`.
 */
export default config;
