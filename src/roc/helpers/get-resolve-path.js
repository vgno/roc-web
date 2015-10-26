import 'source-map-support/register';

import path from 'path';

/**
 * Used on the server to find all dependecies.
 *
 * When creating a extension of this project this needs to be extended.
 *
 * @example
 * import path from 'path';
 * import { getResolvePath } from 'roc-web';
 *
 * export default function(...resolvePaths) {
 *     return getResolvePath(path.join(__dirname, '..', 'node_modules'), ...resolvePaths);
 * }
 *
 * @param {...string} resolvePaths - Paths to be resolved.
 * @returns {string} Path that can be used with `Module._initPaths()`.
 */
export default function getResolvePath(...resolvePaths) {
    return resolvePaths.reduce(
        (previousValue, currentValue) => `${previousValue}:${currentValue}`,
        path.join(__dirname, '..', '..', 'node_modules')
    );
}
