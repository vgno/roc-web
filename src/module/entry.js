/* global MODULE_ENTRY MODULE_STYLE */

// Export the module entry
export const module = require(MODULE_ENTRY);

// Export the module style (will be converted to ICSS, a object with class name mappings)
export const style = require(MODULE_STYLE);
