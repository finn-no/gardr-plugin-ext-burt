var win = global, d = document, gardrParams;
var validateOpts = require('define-options')({
    burtScript       : 'string    - url to the burt xdi-script'
});

function factory (options) {
    validateOpts(options);

    return function (gardr) {
        loadBurt(options, gardr);
    };
}

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

function loadBurt (options, gardr) {
    win.burtApi = win.burtApi || [];
    gardr.on('params:parsed', saveParams);
    gardr.on('element:containercreated', trackGardrContainer);

    var s = d.createElement('script');
    s.src = options.burtScript;
    d.getElementsByTagName('script')[0].appendChild(s);
}

module.exports = factory;
