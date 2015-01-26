Ext.define('WGL.view.WaveGL', {
	extend: 'Ext.container.Container',
	requires: [
		'WGL.view.WaveGLController',
		'WGL.view.Keyboard'
	],
	alias: 'widget.wavegl',
	controller: 'WaveGLController',
	layout: {
		type: 'vbox',
		align: 'stretch'
	},
	items: [{
		xtype: 'container',
		layout: 'fit',
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
			playNote: 'onPlayNote',
			stopNote: 'onStopNote'
		}
	}]
});

