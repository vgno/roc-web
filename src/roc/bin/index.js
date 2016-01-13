#! /usr/bin/env node

import 'source-map-support/register';

import { runCli } from 'roc';

const pkg = require('../../package.json');

runCli({
    version: pkg.version,
    name: pkg.name
});
