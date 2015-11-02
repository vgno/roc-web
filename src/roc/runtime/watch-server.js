import 'source-map-support/register';

import path from 'path';
import debug from 'debug';
import watch from 'node-watch';
import browserSync from 'browser-sync';
import childProcess from 'child_process';

import { getDevPort } from '../helpers/dev';
import config from '../helpers/get-config';

debug.enable(config.dev.debug);

const getPort = port => port || process.env.PORT || config.port;

/**
 * Server watcher.
 *
 * Will restart the server when detecting a change in the application bundle along with what is configured in
 * 'roc.config.js'.
 *
 * @param {object} compiler - a Webpack compiler instance
 * @param {{port: number, devPort: number}} [options] - Options for the server watcher.
 * @returns {Promise} Resolves after it has completed.
 */
export default function watchServer(compiler, options = {}) {
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
            const { port, devPort } = options;

            browserSync({
                port: getDevPort(devPort) + 1,
                proxy: `0.0.0.0:${getPort(port)}`,
                snippetOptions: {
                    rule: {
                        match: /<\/body>/i,
                        fn: (snippet, match) => {
                            // Makes sure we are not overwriting the debug state of something has changed it
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
                    port: getDevPort(devPort) + 2
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
            initServer(artifact);
            return resolve();
        });
    });
}
