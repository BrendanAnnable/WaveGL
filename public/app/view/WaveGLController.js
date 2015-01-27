Ext.define('WGL.view.WaveGLController', {
	extend: 'Ext.app.ViewController',
	alias: 'controller.WaveGLController',
	audioContext: null,
	gainNode: null,
	notes: null,
	playNote: function (note, frequency) {
		var oscillator = this.audioContext.createOscillator();
		oscillator.type = 'sine';
		oscillator.frequency.value = frequency;
		oscillator.connect(this.gainNode);
		oscillator.start();
		this.notes[note] = oscillator;
	},
	stopNote: function (note, frequency) {
		this.notes[note].stop();
		delete this.notes[note];
	},
	onPlayNote: function (note, frequency) {
		this.playNote(note, frequency);
	},
	onStopNote: function (note, frequency) {
		this.stopNote(note, frequency);
	},
	init: function () {
		// http://beausievers.com/synth/synthbasics/
		this.notes = {};
		var ctx = this.audioContext = new AudioContext();

		var gainNode = this.gainNode = ctx.createGain();
		gainNode.gain.value = 0.05;
		gainNode.connect(ctx.destination);
	}
});
