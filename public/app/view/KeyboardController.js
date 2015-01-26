Ext.define('WGL.view.KeyboardController', {
	extend: 'Ext.app.ViewController',
	alias: 'controller.KeyboardController',
	keyboard: null,
	onBoxReady: function () {
		this.keyboard = new QwertyHancock({
			id: this.getView().getId(),
			octaves: 2,
			whiteNotesColour: 'white',
			blackNotesColour: 'black',
			hoverColour: '#f3e939'
		});
	}
});
