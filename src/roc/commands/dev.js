import 'source-map-support/register';

import fs from 'fs';
import path from 'path';
import colors from 'colors/safe';
import mkdirp from 'mkdirp';

import { getSettings, appendSettings } from 'roc-config';

import clean from '../builder/utils/clean';
import { baseConfig } from '../helpers/config';
import { getBuilder } from '../helpers/plugin-managment';

import watchClient from '../runtime/watch-client';
import watchServer from '../runtime/watch-server';

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

const createWatcher = (debug, settings, target, { buildConfig, builder }, watcher) => {
    return clean(settings.build.outputPath[target])
        .then(() => {
            const compiler = builder(buildConfig);
            return startWatcher(target, compiler, buildConfig, watcher, settings.build.outputName);
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
 * Development runner.
 *
 * Helper for starting an application in watch mode.
 *
 * @param {object} rocCommandObject - A command object
 */
export default function runDev({
    debug,
    configObject: { settings, plugins },
    extensionConfig: { plugins: extensionPlugins }
}) {
    if (!plugins || !plugins.createBuilder) {
        throw new Error('No createBuilder defined in plugins in roc.config.js!');
    }

    const watcher = {
        client: watchClient,
        server: watchServer
    };

    // Make sure that we are in dev mode
    if (settings.build.mode !== 'dev') {
        if (settings.build.mode && settings.build.mode !== baseConfig.settings.build.mode) {
            /* eslint-disable no-console */
            console.log(colors.yellow(`The mode in the configuration was ${settings.build.mode} but it needs ` +
                `to be "dev". It has been automatically set to "dev" during this watch run.`));
            /* eslint-enable */
        }

        appendSettings({build: {mode: 'dev'}});
        settings = getSettings();
    }

    // If the targets are both client and server we make sure the client is completed before continuing with the server
    if (settings.build.target.indexOf('client') > -1 && settings.build.target.indexOf('server') > -1) {
        const clientBuilder = getBuilder(debug, 'client', plugins.createBuilder, extensionPlugins.createBuilder);
        createWatcher(debug, settings, 'client', clientBuilder, watcher).then(() => {
            const serverBuilder = getBuilder(debug, 'server', plugins.createBuilder, extensionPlugins.createBuilder);
            createWatcher(debug, settings, 'server', serverBuilder, watcher);
        });
    } else {
        settings.build.target.map((target) => {
            const builder = getBuilder(debug, target, plugins.createBuilder, extensionPlugins.createBuilder);
            createWatcher(debug, settings, target, builder, watcher);
        });
    }
}
