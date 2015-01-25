Ext.Loader.setConfig({
	disableCaching : false
});

Ext.onReady(function() {
	Ext.syncRequire('Ext.app.Application');
	Ext.application({
		name: 'WGL',
		paths: {
			'Ext': 'lib/extjs/src',
			'Ext.ux': 'lib/extjs/examples/ux'
		},
		autoCreateViewport: true
	});
});

