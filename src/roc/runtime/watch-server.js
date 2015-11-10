import 'source-map-support/register';

import path from 'path';
import debug from 'debug';
import watch from 'node-watch';
import browserSync from 'browser-sync';
import childProcess from 'child_process';

import { getDevPort, getPort } from '../helpers/general';
import { getConfig } from '../helpers/config';

/**
 * Server watcher.
 *
 * @param {object} compiler - a Webpack compiler instance
 * @returns {Promise} Resolves after it has completed.
 */
export default function watchServer(compiler) {
    const config = getConfig();
    debug.enable(config.dev.debug);

    const watcherLogger = debug('roc:dev:server:watcher');
    const builderLogger = debug('roc:dev:server:builder');

    let initiated = false;

    const initServer = (bundlePath) => {
        if (initiated) {
            return;
        }

        initiated = true;

        let server;
        let startServer;
        let once = false;

        const restartServer = () => {
            server.kill('SIGTERM');
            return startServer();
        };

        const initBrowsersync = () => {
            browserSync({
                port: parseInt(getDevPort(), 10) + 1,
                proxy: `0.0.0.0:${getPort()}`,
                snippetOptions: {
                    rule: {
                        match: /<\/body>/i,
                        fn: (snippet, match) => {
                            // The logic here is to make sure we don't override options set by something else
                            // We merge if the debug option has changed since we touched it last
                            const debugOptions = (
                                `<script>
                                    if (localStorage.debugTemp === localStorage.debug) {
                                        localStorage.debug = '${config.dev.debug}';
                                    } else {
                                        localStorage.debug = localStorage.debug + ',${config.dev.debug}';
                                    }
                                    localStorage.debugTemp = localStorage.debug;
                                </script>`
                            );
                            return debugOptions + snippet + match;
                        }
                    }
                },
                open: config.dev.open,
                ui: {
                    port: parseInt(getDevPort(), 10) + 2
                }
            });
        };

        const watchForChanges = () => {
            watch([bundlePath].concat(config.dev.watch), (file) => {
                watcherLogger('Server restarting due to: ', file);
                restartServer();
            });
        };

        const listenForInput = (key = 'rs') => {
            process.stdin.resume();
            process.stdin.setEncoding('utf8');
            process.stdin.on('data', function(data) {
                const parsedData = (data + '').trim().toLowerCase();
                if (parsedData === key) {
                    watcherLogger(`Server restarting due to user input [${key}]`);
                    restartServer();
                }
            });
        };

        startServer = () => {
            server = childProcess.fork(bundlePath);
            process.on('exit', () => server.kill('SIGTERM'));

            server.once('message', (message) => {
                if (message.match(/^online$/)) {
                    if (!once) {
                        once = true;
                        initBrowsersync();
                        listenForInput();
                        watchForChanges();
                    } else if (config.dev.reloadOnServerChange) {
                        browserSync.reload();
                    }
                }
            });
        };

        startServer();
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
            builderLogger(`Server rebuilt ${statsJson.time} ms`);

            // FIXME
            if (statsJson.errors.length > 0) {
                statsJson.errors.map(err => console.log(err));
            }

            // FIXME
            if (statsJson.warnings.length > 0) {
                statsJson.warnings.map(wrn => console.log(wrn));
            }

            let bundleName = 'app.server.bundle.js';

            if (statsJson.assets && statsJson.assets.length > 0) {
                bundleName = statsJson.assets[0].name;
            }

            const artifact = path.join(compiler.outputPath, '/', bundleName);

            // start first time
            initServer(artifact);
            return resolve();
        });
    });
}
