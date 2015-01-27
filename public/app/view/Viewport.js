Ext.define('WGL.view.Viewport', {
	extend: 'Ext.container.Viewport',
	layout: 'border',
	requires: [
		'WGL.view.WaveGL',
		'Ext.layout.container.Border'
	],
	items: [{
		xtype: 'wavegl',
		region: 'center'
	}]
});

