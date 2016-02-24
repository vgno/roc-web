module.exports = {
    settings: {
        runtime: {
            port: 8080,
            serve: ['files', 'build/client'],
            favicon: 'files/roc.png'
        },
        build: {
            assets: ['style_1.css', 'style_2.scss'],
            entry: {
                client: 'client.js',
                server: 'server.js'
            }
        },
        dev: {
            open: true
        }
    }
};
