import 'source-map-support/register';

import { generateTextDocumentation, generateMarkdownDocumentation } from 'roc-config';

export build from '../helpers/run-build';
export dev from '../helpers/run-watch';
export start from '../runtime/start';

export function listSettings(debug, config, meta, extensionConfig) {
    console.log(generateTextDocumentation(extensionConfig, meta));
}

export function markdownSettings(debug, config, meta, extensionConfig) {
    console.log(generateMarkdownDocumentation(extensionConfig, meta));
}
