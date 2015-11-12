import 'source-map-support/register';

import path from 'path';
import debug from 'debug';

import { getConfig } from '../helpers/config';

/**
 * Starts a Roc application.
 *
 * @param {!string} [artifact] - Path to a Roc application server bundle.
 */
export default function start(artifact) {
    const config = getConfig();
    debug.enable(config.dev.debug);

    artifact = artifact ||
        path.join(process.cwd(), config.build.outputPath.server, `${config.build.outputName}.roc.js`);

    debug('roc:start')(`Starting Roc application…`);
    require(artifact);
}
