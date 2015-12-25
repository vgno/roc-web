import 'source-map-support/register';

import path from 'path';
import debug from 'debug';

/**
 * Starts a Roc application.
 *
 * @param {boolean} debugEnabled - If debug is enabled
 * @param {object} configuration - A configuration object that should be used
 * @param {object} _meta - Not used
 * @param {object} args - Arguments, expected to find artifact under args.arguments.artifact
 */
export default function start(debugEnabled, { settings }, _meta, args) {
    debug.enable(settings.dev.debug);

    const artifact = args.arguments.artifact ||
        settings.runtime.startBundle && path.join(process.cwd(), settings.runtime.startBundle) ||
        path.join(process.cwd(), settings.build.outputPath.server, `${settings.build.outputName}.roc.js`);

    debug('roc:start')(`Starting Roc application…`);
    require(artifact);
}
