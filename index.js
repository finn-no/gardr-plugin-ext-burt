var win = global, d = document, gardrParams;
var validateOpts = require('define-options')({
    burtScript       : 'string    - url to the burt xdi-script'
});

function saveParams (params) {
    gardrParams = params;
}

function trackGardrContainer (el) {
    if ( win.burtApi.trackById ) {
        el.setAttribute('data-name', gardrParams.id);
        el.setAttribute('data-xdi-id', gardrParams.id);
        win.burtApi.trackById(el.id);
    } else {
        win.burtApi.push(trackGardrContainer.bind(null, el));
    }
}

function burtExt (gardrPluginApi, options) {
    win.burtApi = win.burtApi || [];
    gardrPluginApi.on('params:parsed', saveParams);
    gardrPluginApi.on('element:containercreated', trackGardrContainer);

    var s = d.createElement('script');
    s.src = options.burtScript;
    d.getElementsByTagName('script')[0].appendChild(s);
}

module.exports = burtExt;
