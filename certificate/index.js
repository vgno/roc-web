const join = require('path').join;

module.exports = {
    getKey: function() {
        return join(__dirname, 'roc-development-certificate.key');
    },

    getCert: function() {
        return join(__dirname, 'roc-development-certificate.crt');
    }
};
