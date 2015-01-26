Ext.define('WGL.view.WaveGLController', {
	extend: 'Ext.app.ViewController',
	alias: 'controller.WaveGLController',
	audioContext: null,
	statics: {
		Key: {
			C4: 40, // 261.626
			E4: 44, // 329.628
			G4: 47, // 391.995
			C5: 52  // 523.251
		}
	},
	getFrequency: function (key) {
		// http://en.wikipedia.org/wiki/Piano_key_frequencies
		return 440 * Math.pow(2, (key - 49) / 12);
	},
	addNote: function (buffer, key) {
		var channel = buffer.getChannelData(0);
		var frequency = this.getFrequency(key);
		for (var i = 0; i < channel.length; i++) {
			// This is an OscillatorNode, but where is the fun in that? :)
			channel[i] += Math.sin(i * frequency * 2 * Math.PI / buffer.sampleRate);
		}
		channel.numNotes++;
	},
	normalize: function (buffer) {
		var channel = buffer.getChannelData(0);
		var numNotes = buffer.numNotes;
		if (numNotes > 1) {
			for (var i = 0; i < channel.length; i++) {
				channel[i] /= numNotes;
			}
		}
	},
	onPlayNote: function (note, frequency) {
		console.log('play', note, frequency);
	},
	onStopNote: function (note, frequency) {
		console.log('stop', note, frequency);
	},
	init: function () {
		// http://beausievers.com/synth/synthbasics/
		var ctx = this.audioContext = new AudioContext();
		var sampleRate = ctx.sampleRate;
		var length = sampleRate * 5;
		var buffer = ctx.createBuffer(1, length, sampleRate);
		buffer.numNotes = 0;

		this.addNote(buffer, this.self.Key.C4);
		this.addNote(buffer, this.self.Key.E4);
		this.addNote(buffer, this.self.Key.G4);
		this.addNote(buffer, this.self.Key.C5);
		this.normalize(buffer);

		var source = ctx.createBufferSource();
		source.buffer = buffer;

		var gainNode = ctx.createGain();
		gainNode.gain.value = 0.05;
		source.connect(gainNode);
		gainNode.connect(ctx.destination);

		// play sound
		//source.start(0);
	}
});
