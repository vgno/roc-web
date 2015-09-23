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

        it('must expose startDev as a function', () => {
            expect(api.startDev).to.be.a('function');
        });
    });
});
