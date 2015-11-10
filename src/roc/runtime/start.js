import 'source-map-support/register';

import debug from 'debug';

import { getConfig } from '../helpers/config';

/**
 * Starts a Roc application.
 *
 * @param {!string} artifact - Path to a Roc application server bundle.
 */
export default function start(artifact) {
    const config = getConfig();
    debug.enable(config.dev.debug);

    debug('roc:dev')(`Starting Roc application…`);
    require(artifact);
}
