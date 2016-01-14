import 'source-map-support/register';

import devip from 'dev-ip';
import colors from 'colors/safe';

import { getSettings } from 'roc';

import { baseConfig } from './config';

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
    const settings = getSettings('dev');

    if (settings.port !== baseConfig.settings.dev.port && process.env.DEV_PORT && onceDevPort) {
        onceDevPort = false;
        /* eslint-disable no-console */
        console.log(colors.red('You have configured a dev port but the environment ' +
            'variable DEV_PORT is set and that will be used instead. The port that will be used is ' +
            process.env.DEV_PORT
        ));
        /* eslint-enable */
    }
    return process.env.DEV_PORT || settings.port;
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
    const settings = getSettings('runtime');

    if (settings.port && process.env.PORT && oncePort) {
        oncePort = false;
        /* eslint-disable no-console */
        console.log(colors.red('You have configured a port but the environment ' +
            'variable PORT is set and that will be used instead. The port that will be used is ' +
            process.env.PORT
        ));
        /* eslint-enable */
    }

    return process.env.PORT || settings.port;
}

/**
* Removes possible trailing slashes from a path.
*
* @param {string} path - Path to remove possible trailing slashes.
*
* @returns {string} - Path without trailing slashes.
*/
export function removeTrailingSlash(path) {
    const newPath = path.replace(/\/+$/, '');

    if (!newPath) {
        return '/';
    }

    return newPath;
}

/**
* Adds a trailing slashes to a path.
*
* Runs {@link removeTrailingSlash} internally first.
*
* @param {string} path - Path to add a trailing slashes to.
*
* @returns {string} - Path with trailing slash.
*/
export function addTrailingSlash(path) {
    const newPath = removeTrailingSlash(path);

    if (newPath !== '/') {
        return newPath + '/';
    }

    return newPath;
}
