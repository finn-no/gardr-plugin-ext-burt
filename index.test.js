var burtExt = require('./index.js'),
    win = global,
    PluginApi = require('gardr-core-plugin').PluginApi;

function mockBurtScript () {
    var burtApi = global.burtApi;
    burtApi.trackByNode = sinon.spy(function() {
        return 'burtUnitMock';
    });
    burtApi.trackById = sinon.spy();
    if (burtApi.length > 0) {
        burtApi.shift()();
    }
}

function createContainer () {
    var c = document.createElement('span');
    c.id = 'gardr';

    return c;
}

describe('burt-ext', function () {
    var options = {
        burtScript: 'about:blank'
    };
    var pluginApi;

    options.modify = function modify (removeKey, extendObj) {
        var obj = extendObj || {};
        for (var key in this) {
            if (key !== removeKey) { obj[key] = this[key]; }
        }
        return obj;
    };

    beforeEach(function () {
        pluginApi = new PluginApi();
        sinon.spy(pluginApi, 'on');
    });

    afterEach(function () {
        global.burtApi = undefined;
    });

    it('should throw if no options argument', function () {
        expect(function () {
            burtExt();
        }).to.throw();
    });

    it('should throw if missing burtScript options argument', function () {
        expect(function () {
            burtExt(null, options.modify('burtScript'));
        }).to.throw();
    });

    describe('plugin', function () {
        it('should define window.burtApi', function () {
            burtExt(pluginApi, options);
            expect(global.burtApi).to.be.an('array');
        });

        it('should inject a script with burtScript as src', function () {
            var spy = sinon.spy(Node.prototype, 'appendChild');
            burtExt(pluginApi, options);
            expect(spy).to.have.been.calledWithMatch(function (script) {
                return script.src === options.burtScript;
            });
            spy.restore();
        });

        it('should call burtApi.trackByNode if burtScript loads before container is created', function () {
            burtExt(pluginApi, options);

            mockBurtScript();

            var container = createContainer();
            pluginApi.trigger('params:parsed', {id: 'test1'});
            pluginApi.trigger('element:containercreated', container);
            expect(burtApi.trackByNode).to.have.been.calledOnce;
            expect(burtApi.trackByNode).to.have.been.calledWith(container);
        });

        it('should call burtApi.trackByNode if burtScript loads after container is created', function () {
            burtExt(pluginApi, options);

            var container = createContainer();
            pluginApi.trigger('params:parsed', {id: 'test2'});
            pluginApi.trigger('element:containercreated', container);

            mockBurtScript();

            expect(burtApi.trackByNode).to.have.been.calledOnce;
            expect(burtApi.trackByNode).to.have.been.calledWith(container);
        });

        it('should call burtApi.trackByNode with proper arguments', function () {
            var burtPlugin = burtExt(pluginApi, options);
            mockBurtScript();
            var gardrId = 'foo';

            var container = createContainer();
            pluginApi.trigger('params:parsed', {id: gardrId});
            pluginApi.trigger('element:containercreated', container);
            expect(burtApi.trackByNode).to.have.been.calledWithExactly(container, { name : gardrId, xdiId : gardrId });
        });

        it('should set data-name and data-xdi-id on container', function () {
            burtExt(pluginApi, options);
            mockBurtScript();
            var params = {id: 'test4'};

            pluginApi.trigger('params:parsed', params);

            var container = createContainer();
            pluginApi.trigger('element:containercreated', container);

            expect(container.getAttribute('data-name')).to.equal(params.id);
            expect(container.getAttribute('data-xdi-id')).to.equal(params.id);
        });

        it('should not throw if burtConnect not specified in options', function () {
            expect(function () {
                var burtPlugin = burtExt(pluginApi, options.modify('burtConnect'));
                mockBurtScript();

                pluginApi.trigger('params:parsed', {id: 'footest'});
                pluginApi.trigger('element:containercreated', createContainer());
            }).not.to.throw();
        });

        it('should call burtConnect after container created', function () {
            var spy = sinon.spy();
            var burtPlugin = burtExt(pluginApi, options.modify(null, {
                burtConnect: spy
            }));
            mockBurtScript();

            var container = createContainer();

            pluginApi.trigger('params:parsed', {id: 'footest'});
            pluginApi.trigger('element:containercreated', container);

            expect(spy).to.have.been.calledOnce;
            expect(spy).to.have.been.calledWithExactly('burtUnitMock', container);
        });
    });
});
