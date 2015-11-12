import 'source-map-support/register';

import path from 'path';
import devip from 'dev-ip';
import colors from 'colors/safe';

import { getConfig, baseConfig } from './config';

let oncePort = true;
let onceDevPort = true;

/**
 * Returns the current dev path.
 *
 * Will use {@link getDevPort} for getting the port.
 *
 * @param {string} [relativeBuildPath] - Relative path to where the build is saved.
 * @returns {string} The complete dev path on the server including the port.
 */
export function getDevPath(relativeBuildPath = '') {
    const devIp = devip() ? devip()[0] : 'localhost';
    const buildPath = relativeBuildPath && relativeBuildPath.slice(-1) !== '/' ?
        relativeBuildPath + '/' :
        relativeBuildPath;

    return `http://${devIp}:${getDevPort()}/${buildPath}`;
}

/**
 * Returns the current dev port.
 *
 *It will first default to the environment variable `DEV_PORT` and after that `roc.config.js`.
 *
 * Will give a warning if `DEV_PORT` is defined and the value in the configuration is something other than default.
 *
 * @returns {number} The final port for the dev server.
 */
export function getDevPort() {
    const config = getConfig();

    if (config.dev.port !== baseConfig.dev.port && process.env.DEV_PORT && onceDevPort) {
        onceDevPort = false;
        /* eslint-disable no-console */
        console.log(colors.red('You have configured a dev port but the environment ' +
            'variable DEV_PORT is set and that will be used instead. The port that will be used is ' +
            process.env.DEV_PORT
        ));
        /* eslint-enable */
    }
    return process.env.DEV_PORT || config.dev.port;
}

/**
* Returns the current port.
*
* It will first default to the environment variable `PORT` and after that `roc.config.js`.
*
* Will give a warning if `PORT` is defined and the value in the configuration is something other than default.
*
* @returns {number} The final port for the server.
*/
export function getPort() {
    const config = getConfig();

    if (config.port && process.env.PORT && oncePort) {
        oncePort = false;
        /* eslint-disable no-console */
        console.log(colors.red('You have configured a port but the environment ' +
            'variable PORT is set and that will be used instead. The port that will be used is ' +
            process.env.PORT
        ));
        /* eslint-enable */
    }

    return process.env.PORT || config.port;
}

/**
* Makes a path absolute if not already is that
*
* @param {string} filepath - The filepath to make absolute
* @returns {string} A absolute path.
*/
export function getAbsolutePath(filepath) {
    return path.isAbsolute(filepath) ?
        filepath :
        path.join(process.cwd(), filepath);
}
