const expect = require('chai').expect;

describe('Module index', () => {
    describe('Interface', () => {
        const api = require('../lib');

        it('must expose createBuilder as a function', () => {
            expect(api.createBuilder).to.be.a('function');
        });
    });
});
