import path from 'path';
import nodemon from 'nodemon';

let devServer = null;
const serve = (bundlePath) => {
    return () => {
        devServer = nodemon({
            script: bundlePath
        });
    };
};

export function start(artifact) {
    require(artifact);
}

export function watchServer(compiler) {
    return new Promise((resolve, reject) => {
        compiler.watch({
            poll: false
        }, (serverErr, serverStats) => {
            if (serverErr) {
                reject(serverErr);
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

            if (devServer) {
                // queue restart
                devServer
                    .on('quit', serve(artifact))
                    .emit('quit');
                resolve();
                return;
            }
            // start first time
            serve(artifact)();
            resolve();
        });
    });
}

export function watchClient() {
    return new Promise(resolve => resolve());
}
