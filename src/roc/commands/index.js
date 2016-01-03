import 'source-map-support/register';

import { generateTextDocumentation, generateMarkdownDocumentation } from 'roc-config';

export build from './build';
export dev from './dev';
export start from './start';

/**
 * List the settings that are possible with the current extensions.
 *
 * @param {object} rocCommandObject - A command object
 */
export function listSettings({ metaObject, extensionConfig }) {
    console.log(generateTextDocumentation(extensionConfig, metaObject));
}

/**
 * List the settings that are possible with the current extensions in a markdown format.
 *
 * @param {object} rocCommandObject - A command object
 */
export function markdownSettings({ metaObject, extensionConfig }) {
    console.log(generateMarkdownDocumentation(extensionConfig, metaObject));
}
