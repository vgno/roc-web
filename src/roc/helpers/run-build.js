/* eslint-disable no-console */

import 'source-map-support/register';

import MultiProgress from 'multi-progress';
import pretty from 'prettysize';
import colors from 'colors/safe';

import createBuilder from '../builder';
import clean from '../builder/utils/clean';

const multi = new MultiProgress();

const handleCompletion = (results) => {
    console.log(colors.green('\nBuild completed!\n'));

    for (const result of results) {
        if (result) {
            const { stats, target } = result;
            const { time, assets } = stats.toJson({assets: true});
            console.log(colors.bold(target) + ` ${time} ms`);
            for (const asset of assets) {
                console.log(`${asset.name} ${pretty(asset.size)}`);
            }
            console.log();
        }
    }
};

const handleError = (verbose) => (error) => {
    const errorMessage = error.target ? ' for ' + colors.bold(error.target) : '';

    console.log(colors.red(`\n\nBuild failed${errorMessage}\n`));

    console.log(colors.red(error.message));

    if (verbose) {
        console.log(error.stack);
    } else {
        console.log('\nRun with debug for more output.\n');
    }
    /* eslint-disable no-process-exit */
    // Make sure we do not continue trying to build other targets since we need everything to complete
    process.exit(1);
    /* eslint-enable */
};

const build = (buildX, target, config, verbose) => {
    return new Promise((resolve, reject) => {
        clean(config.build.outputPath[target])
            .then(() => {
                const { buildConfig, builder } = buildX(target);

                const compiler = builder(buildConfig);

                if (!config.build.disableProgressbar) {
                    const bar = multi.newBar(`Building ${target} [:bar] :percent :elapsed s :webpackInfo`, {
                        complete: '=',
                        incomplete: ' ',
                        total: 100,
                        // Some "magic" math to make sure that the progress bar fits in the terminal window
                        // Based on the lenght of various    strings used in the output
                        width: (process.stdout.columns - 52)
                    });

                    compiler.apply(new builder.ProgressPlugin(function(percentage, msg) {
                        bar.update(percentage, {
                            // Only use 20 characters for output to make sure it fits in the window
                            webpackInfo: msg.substring(0, 20)
                        });
                    }));
                }

                compiler.run((error, stats) => {
                    if (error) {
                        // Extend the error with what target that failed
                        error.target = target;
                        return reject(error);
                    }

                    // FIXME Handle this better
                    const options = verbose ? null : {errorDetails: false};
                    const statsJson = stats.toJson(options);
                    if (statsJson.errors.length > 0) {
                        statsJson.errors.map(err => console.log(err));
                    }

                    if (statsJson.warnings.length > 0) {
                        statsJson.warnings.map(wrn => console.log(wrn));
                    }

                    return resolve({stats, target});
                });
            })
        .catch(err => console.log(err, err.stack));
    });
};

/**
 * Build runner.
 *
 * Helper for building an application.
 *
 * @param {boolean} debug - If debug is enabled
 * @param {object} configuration - A configuration object that should be used
 * @returns {Promise} A promise that will be resolved when the build is completed
 */
export default function runBuild(debug, { settings, plugins }) {
    let builder = createBuilder;

    if (plugins && plugins.createBuilder) {
        console.log(colors.cyan(`Using the 'createBuilder' defined in the configuration file.\n`));
        builder = plugins.createBuilder;
    }

    /* eslint-disable no-console */
    console.log(colors.cyan(`Starting the builder using "${settings.build.mode}" as the mode.\n`));
    /* eslint-enable */

    const verbose = settings.build.verbose;

    const promises = settings.build.target.map((target) => build(builder, target, settings, verbose));
    return Promise.all(promises)
        .then(handleCompletion)
        .catch(handleError(verbose));
}
