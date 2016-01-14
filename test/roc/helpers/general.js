const expect = require('chai').expect;

describe('roc', () => {
    describe('helpers', () => {
        describe('general', () => {
            const general = require('../../../src/roc/helpers/general');
            describe('removeTrailingSlash', () => {
                const removeTrailingSlash = general.removeTrailingSlash;

                it('should remove trailing slashes', () => {
                    expect(removeTrailingSlash('/')).to.be.equal('/');
                    expect(removeTrailingSlash('/test')).to.be.equal('/test');
                    expect(removeTrailingSlash('/test/')).to.be.equal('/test');
                    expect(removeTrailingSlash('/test///')).to.be.equal('/test');
                });
            });

            describe('removeTrailingSlash', () => {
                const addTrailingSlash = general.addTrailingSlash;

                it('should remove trailing slashes', () => {
                    expect(addTrailingSlash('/')).to.be.equal('/');
                    expect(addTrailingSlash('/test')).to.be.equal('/test/');
                    expect(addTrailingSlash('/test/')).to.be.equal('/test/');
                    expect(addTrailingSlash('/test///')).to.be.equal('/test/');
                });
            });
        });
    });
});
