import 'source-map-support/register';

import path from 'path';
import nodemon from 'nodemon';
import debug from 'debug';

import config from '../helpers/get-config';

debug.enable(config.dev.debug);

/**
 * Server watcher.
 *
 * Will restart the server when detecting a change in the application bundle along with what is configured in
 * 'roc.config.js'.
 *
 * @param {object} compiler - a Webpack compiler instance
 * @returns {Promise} Resolves after it has completed.
 */
export default function watchServer(compiler) {
    const nodemonLogger = debug('roc:dev:server:nodemon');
    const watcherLogger = debug('roc:dev:server:watcher');

    let once = false;
    const startNodemon = (bundlePath) => {
        if (!once) {
            once = true;
            nodemon({
                ext: 'js json',
                script: bundlePath,
                watch: [bundlePath].concat(config.dev.watch)
            });

            nodemon.on('start', () => {
                nodemonLogger('Server has started');
            }).on('quit', () => {
                nodemonLogger('Server has been terminated');
            }).on('restart', (files) => {
                return files ?
                    nodemonLogger('Server restarted due to: ', files) :
                    nodemonLogger('Server restared due to user input [rs]');
            });
        }
    };

    return new Promise((resolve, reject) => {
        compiler.watch({
            poll: false
        }, (serverErr, serverStats) => {
            if (serverErr) {
                return reject(serverErr);
            }

            if (!compiler) {
                return reject(new Error('A compiler instance must be defined in order to start watch!'));
            }

            const statsJson = serverStats.toJson();
            watcherLogger(`Server rebuilt ${statsJson.time} ms`);

            if (statsJson.errors.length > 0) {
                statsJson.errors.map(err => console.log(err));
            }

            if (statsJson.warnings.length > 0) {
                statsJson.warnings.map(wrn => console.log(wrn));
            }

            let bundleName = 'app.server.bundle.js';

            if (statsJson.assets && statsJson.assets.length > 0) {
                bundleName = statsJson.assets[0].name;
            }

            const artifact = path.join(compiler.outputPath, '/', bundleName);

            // start first time
            startNodemon(artifact);
            return resolve();
        });
    });
}
