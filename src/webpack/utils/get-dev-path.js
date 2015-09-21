/*eslint-disable */
'use strict';
/*eslint-enable */

const devip = require('dev-ip');

module.exports = {
    getDevPath: function getDevPath(config) {
        let ip = devip() ? devip()[0] : false;
        let port = module.exports.getDevPort();

        if (config && config.host) {
            ip = config.host;
        }

        return 'http://' + (ip || 'localhost') + ':' + port;
    },

    getDevPort: function(config) {
        if (!config || !config.dev || !config.dev.webpack) {
            return null;
        }
        const { hotLoadPort } = config.dev.webpack;
        return parseInt(hotLoadPort, 10) || 3001;
    }
};
