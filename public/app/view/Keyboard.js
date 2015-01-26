Ext.define('WGL.view.Keyboard', {
	extend: 'Ext.container.Container',
	requires: [
		'WGL.view.KeyboardController'
	],
	alias: 'widget.keyboard',
	controller: 'KeyboardController',
	layout: 'fit',
	listeners: {
		boxready: 'onBoxReady'
	}
});
