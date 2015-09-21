import createWebpackConfig from './webpack/config';
import runWebpack from './webpack/run';
import runWebpackDevServer from './webpack/run';

export default {
    configure: () => {
        return {
            createWebpackConfig,
            runWebpack,
            runWebpackDevServer
        };
    },

    hatch: (incubate = { mode: 'dist' }) => {
        return {};
    }
};

