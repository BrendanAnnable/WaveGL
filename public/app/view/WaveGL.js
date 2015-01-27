Ext.define('WGL.view.WaveGL', {
	extend: 'Ext.container.Container',
	requires: [
		'WGL.view.WaveGLController',
		'WGL.view.Keyboard',
		'Ext.layout.container.Fit'
	],
	alias: 'widget.wavegl',
	controller: 'WaveGLController',
	layout: {
		type: 'vbox',
		align: 'stretch'
	},
	listeners: {
		afterrender: 'onAfterRender'
	},
	items: [{
		xtype: 'container',
		layout: 'fit',
		reference: 'visualiser',
		autoEl: {
			tag: 'canvas',
			style: {
				backgroundColor: '#000'
			}
		},
		flex: 1
	}, {
		xtype: 'keyboard',
		layout: 'fit',
		height: 200,
		listeners: {
			playNote: 'playNote',
			stopNote: 'stopNote'
		}
	}]
});

