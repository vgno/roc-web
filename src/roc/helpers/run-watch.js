import 'source-map-support/register';

import fs from 'fs';
import path from 'path';
import colors from 'colors/safe';
import mkdirp from 'mkdirp';

import { getSettings, appendSettings } from 'roc-config';

import clean from '../builder/utils/clean';
import { baseConfig } from '../helpers/config';
import createBuilder from '../builder';

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

const createWatcher = (settings, target, build, watcher) => {
    return clean(settings.build.outputPath[target])
        .then(() => {
            const { buildConfig, builder } = build(target);
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
 * Watch runner.
 *
 * Helper for starting an application in watch mode.
 *
 * @param {boolean} debug - If debug is enabled
 * @param {object} configuration - A configuration object that should be used
 */
export default function runWatch(debug, { settings, plugins }) {
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

    let builder = createBuilder;

    if (plugins && plugins.createBuilder) {
        /* eslint-disable no-console */
        console.log(colors.cyan(`Using the 'createBuilder' defined in the configuration file.\n`));
        /* eslint-enable */
        builder = plugins.createBuilder;
    }

    // If the targets are both client and server we make sure the client is completed before continuing with the server
    if (settings.build.target.indexOf('client') > -1 && settings.build.target.indexOf('server') > -1) {
        createWatcher(settings, 'client', builder, watcher).then(() => {
            createWatcher(settings, 'server', builder, watcher);
        });
    } else {
        settings.build.target.map((target) => {
            createWatcher(settings, target, builder, watcher);
        });
    }
}
