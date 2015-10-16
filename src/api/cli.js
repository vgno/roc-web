import path from 'path';
import nodemon from 'nodemon';

const initNodemon = () => {
    let once = false;
    return (bundlePath) => {
        if (!once) {
            once = true;
            nodemon({
                ext: 'js json',
                script: bundlePath,
                watch: [
                    'config/',
                    bundlePath
                ]
            });

            nodemon.on('start', () => {
                console.log('Nodemon: Server has started');
            }).on('quit', () => {
                console.log('Nodemon: Server has been terminated');
            }).on('restart', (files) => {
                return files ?
                    console.log('Nodemon: Server restarted due to: ', files) :
                    console.log('Nodemon: Server restared due to user input [rs]');
            });
        }
    };
};
const startNodemon = initNodemon();

export function start(artifact) {
    require(artifact);
}

export function watchServer(compiler) {
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

export function watchClient() {
    return new Promise(resolve => resolve());
}
