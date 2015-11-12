import 'source-map-support/register';

import { getFinalConfig } from 'roc-config';

/**
 * Gives the base configuration.
 *
 * @returns {object} Returns the base configuration
 */
export const baseConfig = require('../config/roc.config.js');

/**
 * Gives the meta configuration.
 *
 * @returns {object} Returns the meta configuration
 */
export const metaConfig = require('../config/roc.config.meta.js');

/**
 * Returns the final configuration
 *
 * The final configuration consists of the default, the application configuration and temporary configuration.
 *
 * @returns {object} The final configuration at this time
 */
export function getConfig() {
    return getFinalConfig(baseConfig);
}
