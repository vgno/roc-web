import 'source-map-support/register';

import debug from 'debug';

import config from '../helpers/get-config';

debug.enable(config.dev.debug);

/**
 * Starts a Roc application.
 *
 * @param {!string} artifact - Path to a Roc application server bundle.
 */
export default function start(artifact) {
    debug('roc:dev')(`Starting Roc application…`);
    require(artifact);
}
