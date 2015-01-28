Ext.define('WGL.view.KeyboardController', {
	extend: 'Ext.app.ViewController',
	alias: 'controller.KeyboardController',
	keyboard: null,
	onBoxReady: function () {
		this.keyboard = new QwertyHancock({
			id: this.getView().getId(),
			octaves: 4,
			whiteNotesColour: 'white',
			blackNotesColour: 'black',
			hoverColour: '#f3e939'
		});
		this.keyboard.keyDown = function (note, frequency) {
			this.getView().fireEvent('playNote', note, frequency);
		}.bind(this);
		this.keyboard.keyUp = function (note, frequency) {
			this.getView().fireEvent('stopNote', note, frequency);
		}.bind(this);
	}
});
