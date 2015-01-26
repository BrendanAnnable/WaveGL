Ext.define('WGL.view.Viewport', {
	extend: 'Ext.container.Viewport',
	layout: 'border',
	requires: [
		'WGL.view.WaveGL',
		'WGL.view.Keyboard'
	],
	items: [{
		xtype: 'wavegl',
		region: 'center'
	}, {
		xtype: 'keyboard',
		region: 'south',
		height: 200
	}]
});

