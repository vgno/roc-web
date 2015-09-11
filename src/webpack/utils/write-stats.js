/*eslint-disable */
'use strict';
/*eslint-enable */

const fs = require('fs');
const path = require('path');

module.exports = function writeStats(stats) {
    const publicPath = this.options.output.publicPath;
    const statsFilepath = path.join(this.options.output.path, 'webpack-stats.json');
    const analysisFilepath = path.join(this.options.output.path, 'webpack-analysis.json');

    const json = stats.toJson();

    // get chunks by name and extensions
    function getChunks(name, e) {
        const ext = e || 'js';
        let chunk = json.assetsByChunkName[name];

        // a chunk could be a string or an array, so make sure it is an array
        if (!(Array.isArray(chunk))) {
            chunk = [chunk];
        }

        return chunk
        // filter by extension
        .filter(function(chunkName) {
            return path.extname(chunkName) === '.' + ext;
        })
        .map(function(chunkName) {
            return publicPath + chunkName;
        });
    }

    const script = getChunks('app', 'js');
    const css = getChunks('app', 'css');

    const content = {
        script: script,
        css: css
    };

    fs.writeFileSync(statsFilepath, JSON.stringify(content));
    fs.writeFileSync(analysisFilepath, JSON.stringify(json));
};
