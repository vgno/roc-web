const expect = require('chai').expect;

describe('Module index', () => {
    describe('Interface', () => {
        const api = require('../lib');

        it('must expose createConfig as a function', () => {
            expect(api.createConfig).to.be.a('function');
        });

        it('must expose build as a function', () => {
            expect(api.build).to.be.a('function');
        });

        it('must expose createServer as a function', () => {
            expect(api.createServer).to.be.a('function');
        });

        it('must expose startServer as a function', () => {
            expect(api.startServer).to.be.a('function');
        });
    });
});
