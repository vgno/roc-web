/*eslint-disable */
'use strict';
/*eslint-enable */

const devip = require('dev-ip');
const config = require('config');
const port = parseInt(config.dev.webpack.hotLoadPort, 10) || 3001;

module.exports = {
    getDevPath: function getDevPath() {
        let ip = devip() ? devip()[0] : false;
        if (config.host) {
            ip = config.host;
        }

        return 'http://' + (ip || 'localhost') + ':' + port;
    },

    port: port
};
