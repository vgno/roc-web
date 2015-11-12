import fs from 'fs';
import path from 'path';
import colors from 'colors/safe';
import mkdirp from 'mkdirp';

import { setApplicationConfig, getApplicationConfig, setTemporaryConfig, validate } from 'roc-config';

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

const startWatcher = (target, compiler, buildConfig, watcher, outputName) => {
    if (target === 'client') {
        writeStatsFile(buildConfig.output.path, buildConfig.output.publicPath + outputName + '.roc.js');
    }

    return watcher[target](compiler);
};

const createWatcher = (config, target, createBuilder, watcher) => {
    return clean(config.build.outputPath[target])
        .then(() => {
            const { buildConfig, builder } = createBuilder(target);
            const compiler = builder(buildConfig);
            return startWatcher(target, compiler, buildConfig, watcher, config.build.outputName);
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
 * If a {@link createBuilder} has been defined in `roc.config.js` it will use that over the provided one.
 *
 * @param {!{createBuilder: function, watchClient: function, watchServer: function}} rocExtension -
 * The Roc Extension to use when starting the watcher, see {@link createBuilder} {@link watchClient} {@link watchServer}
 * @param {string} [appConfigPath] - A path to a `roc.config.js` file that should be used
 * @param {object} [tempConfig] - A configuration object that should be used
 */
export default function runWatch({ createBuilder, watchClient, watchServer }, appConfigPath = '', tempConfig = {}) {
    const watcher = {
        client: watchClient,
        server: watchServer
    };

    setApplicationConfig(appConfigPath);
    setTemporaryConfig(tempConfig);

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

    const applicationConfig = getApplicationConfig();
    if (applicationConfig.createBuilder) {
        /* eslint-disable no-console */
        console.log(colors.cyan(`Using the 'createBuilder' defined in the configuration file.\n`));
        /* eslint-enable */
        createBuilder = applicationConfig.createBuilder;
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
