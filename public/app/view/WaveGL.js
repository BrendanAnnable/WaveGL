Ext.define('WGL.view.WaveGL', {
	extend: 'Ext.container.Container',
	requires: [
		'WGL.view.WaveGLController'
	],
	alias: 'widget.wavegl',
	controller: 'WaveGLController',
	layout: 'fit',
	autoEl: {
		tag: 'canvas',
		style: {
			backgroundColor: '#000'
		}
	}
});

