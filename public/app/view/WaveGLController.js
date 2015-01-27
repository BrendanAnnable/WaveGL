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
		var ctx = this.audioContext;
		var analyser = this.analyser = ctx.createAnalyser();
		// shim analyser between master gain and destination
		this.masterGain.connect(analyser);
		analyser.connect(ctx.destination);
		analyser.fftSize = 2048;
		analyser.buffer = new Float32Array(analyser.fftSize);

		requestAnimationFrame(this.visualise.bind(this));
	},
	playNote: function (note, frequency) {
		var oscillator = this.createOscillator(frequency);
		oscillator.connect(this.masterGain);
		oscillator.start();
		this.notes[note] = oscillator;
	},
	createOscillator: function (frequency) {
		//return this.createOscillatorSimple(frequency);
		return this.createOscillatorCustom(frequency);
	},
	createOscillatorSimple: function (frequency) {
		var ctx = this.audioContext;
		var oscillator = ctx.createOscillator();
		oscillator.type = 'sine';
		oscillator.frequency.value = frequency;
		return oscillator;
	},
	createOscillatorCustom: function (frequency) {
		var ctx = this.audioContext;
		var sampleRate = ctx.sampleRate;
		var oscillator = ctx.createBufferSource();
		var buffer = oscillator.buffer = ctx.createBuffer(1, Math.ceil(sampleRate / frequency), sampleRate);
		var channel = buffer.getChannelData(0);
		for (var i = 0; i < channel.length; i++) {
			channel[i] = Math.sin(i * frequency * 2 * Math.PI / sampleRate);
		}
		oscillator.loop = true;
		return oscillator;
	},
	stopNote: function (note, frequency) {
		this.notes[note].stop();
		delete this.notes[note];
	},
	visualise: function (time) {
		requestAnimationFrame(this.visualise.bind(this));

		var analyser = this.analyser;
		var buffer = analyser.buffer;
		analyser.getFloatFrequencyData(buffer);

		// TODO: visualise the buffer!
	}
});
