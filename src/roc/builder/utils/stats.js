import 'source-map-support/register';

import fs from 'fs';
import path from 'path';

/**
 * A Webpack plugin that writes stats after a completed build.
 *
 * Will create two files:
 *  * `webpack-stats.json` - Containes what files that was created for CSS and JS.
 *  * `webpack-analysis.json` - Containes all stats from the Webpack build. Analyse with webpack.github.io/analyse
 * @param {!object} stats - Webpack stats object.
 * @private
 */
export function writeStats(stats) {
    const publicPath = this.options.output.publicPath;
    const statsFilepath = path.join(this.options.output.path, 'webpack-stats.json');
    const analysisFilepath = path.join(this.options.output.path, 'webpack-analysis.json');

    const json = stats.toJson();

    const content = parseStats(json, publicPath);

    fs.writeFileSync(statsFilepath, JSON.stringify(content));
    fs.writeFileSync(analysisFilepath, JSON.stringify(json));
}

/**
 * A parser for stats that find all JS and CSS files
 *
 * @param {!object} stats - Webpack stats object as JSON.
 * @param {string} publicPath - A path that the files should be prefixed with
 * @returns {object} A object with keys for 'script' and 'css'
 * @private
 */
export function parseStats(stats, publicPath = '') {
    // get chunks by name and extensions
    const getChunks = (ext = 'js', selectedChunk) => {
        const filePath = selectedChunk ? '' : publicPath;
        const chunks = selectedChunk ?
            { [selectedChunk]: stats.assetsByChunkName[selectedChunk] } :
            stats.assetsByChunkName;

        return Object.keys(chunks).map((key) => {
            if ((selectedChunk && chunks[selectedChunk]) || key !== 'manifest') {
                return chunks[key].filter((chunkName) => path.extname(chunkName) === `.${ext}`)
                    .map((chunkName) => filePath + chunkName);
            }

            return [];
        }).reduce((previous, current) => previous.concat(current), []);
    };

    return {
        manifest: getChunks('js', 'manifest'),
        scripts: getChunks('js'),
        styles: getChunks('css')
    };
}
