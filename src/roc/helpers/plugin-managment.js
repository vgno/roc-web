import isPlainObject from 'lodash.isPlainObject';
import isFunction from 'lodash.isFunction';

let once = true;
/**
 * Gets the final rocBuilder object..
 *
 * @param {boolean} debug - If the command should run in debug mode
 * @param {string} target - What target the builder should be configured against
 * @param {function|array|object} createBuilders - The createBuilders defined in the configuration.
    See documentation for more information on what it can be.
 * @param  {object|array} extensionCreateBuilders - The createBuilders defined in the extensions. Should most often be
    an object.
 * @returns {rocBuilder}
 */
export function getBuilder(debug, target, createBuilders, extensionCreateBuilders) {
    if (isPlainObject(createBuilders)) {
        const rocBuilder = getBuildersFromObject(debug, target, createBuilders);
        once = false;
        return rocBuilder;
    } else if (Array.isArray(createBuilders)) {
        let rocBuilder = { buildConfig: {}, builder: require('webpack')};
        createBuilders.forEach((builder) => {
            rocBuilder = builder(target, rocBuilder);
        });
        if (debug && once) {
            once = false;
            console.log('createBuilder overridden in roc.config.js with an array, will use that.');
        }

        return rocBuilder;
    } else if (isFunction(createBuilders)) {
        let rocBuilder = getBuildersFromObject(debug, target, extensionCreateBuilders);

        if (debug) {
            once = false;
            console.log('Will also use the createBuilder defined in roc.config.js.');
        }

        return createBuilders(target, rocBuilder);
    }
}

function getBuildersFromObject(debug, target, createBuilders) {
    const info = [];
    // We we have a default run it first
    const { default: def, ...rest } = createBuilders;
    let rocBuilder = { buildConfig: {}, builder: require('webpack')};

    if (def) {
        info.push('default');
        rocBuilder = def(target, rocBuilder);
    }

    Object.keys(rest).forEach((builder) => {
        info.push(builder);
        rocBuilder = createBuilders[builder](target, rocBuilder);
    });
    if (debug && once) {
        console.log('Will use the following for createBuilder: ', info);
    }

    return rocBuilder;
}
