/* global ROC_PATH_RESOLVER ROC_SERVER_ENTRY */

const getResolvePath = require(ROC_PATH_RESOLVER);

// Init NODE_PATH if not set
if (!process.env.NODE_PATH) {
    process.env.NODE_PATH = '';
}

// This will only work on non Windows machines
process.env.NODE_PATH += `:${getResolvePath()}`;

// Re-init Nodes module package with the new Node Path from above
/* eslint-disable no-underscore-dangle */
require('module').Module._initPaths();
/* eslint-enable */

// Get source map source map support
require('source-map-support').install();

// Start the real entry point
require(ROC_SERVER_ENTRY);
