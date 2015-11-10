import fs from 'fs';
import path from 'path';
import colors from 'colors/safe';
import mkdirp from 'mkdirp';

import { setApplicationConfig, setTemporaryConfig, validate } from 'roc-config';

import clean from '../builder/utils/clean';
import { getConfig, metaConfig, baseConfig } from '../helpers/config';

const writeStatsFile = (buildPath, scriptPath) => {
    fs.stat(buildPath, (err) => {
        if (err) {
            mkdirp.sync(buildPath);
        }

        fs.writeFileSync(path.join(buildPath, 'webpack-stats.json'), JSON.stringify({
            script: [`${scriptPath}`],
            css: ''
        }));
    });
};

const startWatcher = (target, compiler, buildConfig, watcher) => {
    if (target === 'client') {
        // FIXME The bundle name should not be static
        writeStatsFile(buildConfig.output.path, path.join(buildConfig.output.publicPath, 'app.client.bundle.js'));
    }

    return watcher[target](compiler);
};

const createWatcher = (config, target, createBuilder, watcher) => {
    return clean(config.build.outputPath[target])
        .then(() => {
            const { buildConfig, builder } = createBuilder(target);
            const compiler = builder(buildConfig);
            return startWatcher(target, compiler, buildConfig, watcher);
        })
        .catch((error) => {
            /* eslint-disable no-console */
            console.log(colors.red('\nWatch failed!\n'));
            console.log(`A error occoured while starting the ${target} watcher`);
            console.log(error.stack);
            /* eslint-enable */
        });
};

/**
 * Watch runner.
 *
 * Helper for starting an application in watch mode.
 *
 * @param {!object} rocExtension - The Roc Extension to use when starting the watcher
 * @param {string} [applicationConfig] - A path to a `roc.config.js` file that should be used
 * @param {object} [temporaryConfig] - A configuration object that should be used
 */
export default function runWatch(rocExtension, applicationConfig = '', temporaryConfig = {}) {
    const { createBuilder, watchClient, watchServer } = rocExtension;
    const watcher = {
        client: watchClient,
        server: watchServer
    };

    setApplicationConfig(applicationConfig);
    setTemporaryConfig(temporaryConfig);

    let config = getConfig();

    // Make sure that we are in dev mode
    if (config.build.mode !== 'dev') {
        if (config.build.mode && config.build.mode !== baseConfig.build.mode) {
            /* eslint-disable no-console */
            console.log(colors.yellow(`The mode in the configuration was ${config.build.mode} but it needs ` +
                `to be "dev". It has been automatically set to "dev" during this watch run.`));
            /* eslint-enable */
        }

        setTemporaryConfig({build: {mode: 'dev'}});
        config = getConfig();
    }

    validate(config, metaConfig);

    // If the targets are both client and server we make sure the client is completed before continuing with the server
    if (config.build.target.indexOf('client') > -1 && config.build.target.indexOf('server') > -1) {
        createWatcher(config, 'client', createBuilder, watcher).then(() => {
            createWatcher(config, 'server', createBuilder, watcher);
        });
    } else {
        config.build.target.map((target) => {
            createWatcher(config, target, createBuilder, watcher);
        });
    }
}
