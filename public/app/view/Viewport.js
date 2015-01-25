Ext.define('WGL.view.Viewport', {
	extend: 'Ext.container.Viewport',
	layout: 'border',
	requires: [
		'WGL.view.WaveGL'
	],
	items: [{
		xtype: 'wavegl',
		region: 'center'
	}]
});

