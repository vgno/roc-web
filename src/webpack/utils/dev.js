import devip from 'dev-ip';

const DEFAULT_PORT = 3001;

export function getDevPath(config) {
    const devIp = devip() ? devip()[0] : 'localhost';
    const ip = (config && config.host) ? config.host : devIp;
    let contentBase = '';

    if (config && config.buildPath) {
        contentBase = config.buildPath.relative;
    }

    return `http://${ip}:${getDevPort()}/${contentBase}`;
}

export function getDevPort(config) {
    if (!config || !config.dev || !config.dev.webpack || !config.dev.webpack.hotLoadPort) {
        return DEFAULT_PORT;
    }
    const { hotLoadPort } = config.dev.webpack;
    return parseInt(hotLoadPort, 10) || DEFAULT_PORT;
}

