import webpack from 'webpack';
import clearFolder from './utils/clear-folder';

export default function build(webpackConfig) {
    clearFolder(webpackConfig.output.path);
    webpack(webpackConfig, function(err, stats) {
        console.log(err, stats);
    });
}
