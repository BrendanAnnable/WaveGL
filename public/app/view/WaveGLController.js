Ext.define('WGL.view.WaveGLController', {
	extend: 'Ext.app.ViewController',
	alias: 'controller.WaveGLController',
	audioContext: null,
	statics: {
		Note: {
			C_4: 40, // 261.626
			E_4: 44, // 329.628
			G_4: 47, // 391.995
			C_5: 52  // 523.251
		}
	},
	getFrequency: function (note) {
		// http://en.wikipedia.org/wiki/Piano_key_frequencies
		return Math.pow(Math.pow(2, 1 / 12), note - 49) * 440;
	},
	addNode: function (buffer, note) {
		var channel = buffer.getChannelData(0);
		var frequency = this.getFrequency(note);
		for (var i = 0; i < channel.length; i++) {
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
	init: function () {
		var ctx = this.audioContext = new AudioContext();
		var sampleRate = ctx.sampleRate;
		var length = sampleRate * 5;
		var buffer = ctx.createBuffer(1, length, sampleRate);
		buffer.numNotes = 0;

		this.addNode(buffer, this.self.Note.C_4);
		this.addNode(buffer, this.self.Note.E_4);
		this.addNode(buffer, this.self.Note.G_4);
		this.addNode(buffer, this.self.Note.C_5);
		this.normalize(buffer);

		var source = ctx.createBufferSource();
		source.buffer = buffer;

		var gainNode = ctx.createGain();
		gainNode.gain.value = 0.05;
		source.connect(gainNode);
		gainNode.connect(ctx.destination);

		// play sound
		source.start(0);
	}
});
