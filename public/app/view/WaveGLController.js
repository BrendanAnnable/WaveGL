/**
 * http://beausievers.com/synth/synthbasics/
 */
Ext.define('WGL.view.WaveGLController', {
	extend: 'Ext.app.ViewController',
	alias: 'controller.WaveGLController',
	audioContext: null,
	masterGain: null,
	notes: null,
	init: function () {
		this.notes = {};

		this.initAudio();
		this.initVisualiser();
	},
	initAudio: function () {
		this.audioContext = new AudioContext();

		var masterGain = this.masterGain = this.audioContext.createGain();
		masterGain.gain.value = 0.5;
		masterGain.connect(this.audioContext.destination);
	},
	initVisualiser: function () {
		requestAnimationFrame(this.visualise.bind(this));
	},
	playNote: function (note, frequency) {
		var oscillator = this.audioContext.createOscillator();
		oscillator.type = 'sine';
		oscillator.frequency.value = frequency;
		oscillator.connect(this.masterGain);
		oscillator.start();
		this.notes[note] = oscillator;
	},
	stopNote: function (note, frequency) {
		this.notes[note].stop();
		delete this.notes[note];
	},
	visualise: function (time) {
		requestAnimationFrame(this.visualise.bind(this));

		// TODO: FFT
	}
});
