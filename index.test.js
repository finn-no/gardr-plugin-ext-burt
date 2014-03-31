var burtExt = require('./index.js');
var PluginApi = require('gardr-core-plugin').PluginApi;

function mockBurtScript () {
    var burtApi = global.burtApi;
    burtApi.trackByNode = sinon.spy();
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

    options.without = function without (removeKey) {
        var obj = {};
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
            burtExt(options.without('burtScript'));
        }).to.throw();
    });

    it('should take an object litteral an return a function', function () {
        var burtPlugin = burtExt(options);
        expect(burtPlugin).to.be.a('function');
    });

    describe('plugin', function () {
        it('should define window.burtApi', function () {
            var burtPlugin = burtExt(options);
            burtPlugin(pluginApi);
            expect(global.burtApi).to.be.an('array');
        });

        it('should inject a script with burtScript as src', function () {
            var burtPlugin = burtExt(options);
            var spy = sinon.spy(Node.prototype, 'appendChild');

            burtPlugin(pluginApi);
            expect(spy).to.have.been.calledWithMatch(function (script) {
                return script.src === options.burtScript;
            });
            spy.restore();
        });

        it('should call burtApi.trackById if burtScript loads before container is created', function () {
            var burtPlugin = burtExt(options);
            burtPlugin(pluginApi);

            mockBurtScript();
            pluginApi.trigger('params:parsed', {id: 'test1'});
            pluginApi.trigger('element:containercreated', createContainer());
            expect(burtApi.trackById).to.have.been.calledOnce;
            expect(burtApi.trackById).to.have.been.calledWith('gardr');
        });

        it('should call burtApi.trackById if burtScript loads after container is created', function () {
            var burtPlugin = burtExt(options);
            burtPlugin(pluginApi);

            pluginApi.trigger('params:parsed', {id: 'test2'});
            pluginApi.trigger('element:containercreated', createContainer());
            mockBurtScript();
            expect(burtApi.trackById).to.have.been.calledOnce;
            expect(burtApi.trackById).to.have.been.calledWith('gardr');
        });

        it('should set data-name and data-xdi-id on container', function () {
            var burtPlugin = burtExt(options);
            burtPlugin(pluginApi);
            var params = {id: 'test3'};
            pluginApi.trigger('params:parsed', params);

            var container = createContainer();
            pluginApi.trigger('element:containercreated', container);
            mockBurtScript();

            expect(container.getAttribute('data-name')).to.equal(params.id);
            expect(container.getAttribute('data-xdi-id')).to.equal(params.id);
        });
    });
});
