import 'source-map-support/register';

import devip from 'dev-ip';

import config from './get-config';

/**
 * Returns the current dev path.
 *
 * If no port is given it will first default to the environment variable `DEV_PORT` and after that `roc.config.js`.
 *
 * @param {number} [devPort=DEV_PORT/roc.config.js] - The port for the dev server.
 * @param {string} [relativeBuildPath] - Relative path to where the build is saved.
 * @returns {string} The complete dev path on the server including the port.
 */
export function getDevPath(devPort, relativeBuildPath = '') {
    const devIp = devip() ? devip()[0] : 'localhost';

    return `http://${devIp}:${getDevPort(devPort)}/${relativeBuildPath}`;
}

/**
 * Returns the current dev port.
 *
 * If no port is given it will first default to the environment variable `DEV_PORT` and after that `roc.config.js`.
 *
 * @param {number} [devPort=DEV_PORT/roc.config.js] - The port for the dev server.
 * @returns {number} The final port for the dev server.
 */
export function getDevPort(devPort) {
    return devPort || process.env.DEV_PORT || config.dev.port;
}
