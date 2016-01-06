import 'source-map-support/register';

import path from 'path';
import debug from 'debug';

/**
 * Starts a Roc application.
 *
 * @param {object} rocCommandObject - A command object
 */
export default function start({ configObject: { settings }, parsedOptions }) {
    debug.enable(settings.dev.debug);

    const artifact = parsedOptions.options.artifact ||
        settings.runtime.startBundle && path.join(process.cwd(), settings.runtime.startBundle) ||
        path.join(process.cwd(), settings.build.outputPath.server, `${settings.build.outputName}.roc.js`);

    debug('roc:start')(`Starting Roc application…`);
    require(artifact);
}
