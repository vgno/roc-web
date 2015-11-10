import 'source-map-support/register';

// Builder
export createBuilder from './builder';

// Helpers
export getResolvePath from './helpers/get-resolve-path';
export { getAbsolutePath } from './helpers/general';

// Runtime
export start from './runtime/start';
export watchClient from './runtime/watch-client';
export watchServer from './runtime/watch-server';

// Configuration
export configFile from './default/roc.config.js';
export { baseConfig } from './helpers/config';
export { metaConfig } from './helpers/config';
export { config } from './helpers/config';

export runBuild from './helpers/run-build';
export runWatch from './helpers/run-watch';
