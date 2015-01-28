/**
 * http://beausievers.com/synth/synthbasics/
 */
Ext.define('WGL.view.WaveGLController', {
	extend: 'Ext.app.ViewController',
	alias: 'controller.WaveGLController',
	audioContext: null,
	masterGain: null,
	analyser: null,
	scene: null,
	camera: null,
	renderer: null,
	notes: null,
	init: function () {
		this.notes = {};
	},
	onAfterRender: function () {
		this.initAudio();
		this.initVisualiser();
	},
	initAudio: function () {
		var ctx = this.audioContext = new AudioContext();

		var masterGain = this.masterGain = ctx.createGain();
		masterGain.gain.value = 0.1;
		masterGain.connect(ctx.destination);

		// This is purely created so that something is always playing, so that the FFT keeps updating
		// analyser.getFloatFrequencyData doesn't modify the given buffer if nothing is playing
		// i.e. Preferably shouldn't need this
		var idle = ctx.createBufferSource();
		idle.buffer = ctx.createBuffer(1, 1, ctx.sampleRate);
		idle.loop = true;
		idle.connect(masterGain);
		idle.start();
	},
	initVisualiser: function () {
		var ctx = this.audioContext;
		var analyser = this.analyser = ctx.createAnalyser();
		// shim analyser between master gain and destination
		this.masterGain.connect(analyser);
		analyser.connect(ctx.destination);
		analyser.fftSize = 2048;
		analyser.smoothingTimeConstant = 0.8;
		analyser.buffer = new Float32Array(analyser.frequencyBinCount);

		var view = this.getView();
		var width = view.getWidth();
		var height = view.getHeight();
		this.scene = new THREE.Scene();
		this.camera = new THREE.OrthographicCamera(0, width, height, 0, 0.1, 100);
		this.renderer = new THREE.WebGLRenderer({
			canvas: this.lookupReference('visualiser').getEl().dom
		});
		this.renderer.setSize(width, height);

		/*var geometry = new THREE.PlaneBufferGeometry(width, height);
		geometry.applyMatrix(new THREE.Matrix4().makeTranslation(width / 2, height / 2, 0));
		var material = new THREE.ShaderMaterial({
			uniforms: {
				fft: {type: 't'}
			},
			vertexShader: [
				"varying vec2 vuv;",
				"void main() {",
					"vuv = uv;",
					"gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);",
				"}"
			].join("\n"),
			fragmentShader: [
				"uniform sampler2D fft;",
				"varying vec2 vuv;",
				"void main() {",
					"float amp = texture2D(fft, vuv).r;",
					"gl_FragColor = vec4(amp, 0.0, 0.0, 1.0);",
				"}"
			].join("\n")
		});
		var mesh = this.quad = new THREE.Mesh(geometry, material);
		mesh.frustumCulled = false;
		mesh.depthTest = false;
		mesh.depthWrite = false;
		this.scene.add(mesh);*/

		geometry = new THREE.BufferGeometry();
		var positions = new Float32Array(analyser.frequencyBinCount);
		for (var i = 0; i < positions.length; i++) {
			positions[i] = i * analyser.frequencyBinCount / width;
		}
		geometry.addAttribute('position', new THREE.BufferAttribute(positions, 1));
		geometry.addAttribute('amplitude', new THREE.BufferAttribute(analyser.buffer, 1));
		material = new THREE.RawShaderMaterial({
			attributes: {
				position: {type: 'f'},
				amplitude: {type: 'f'}
			},
			uniforms: {
				minDecibels: {type: 'f', value: analyser.minDecibels},
				maxDecibels: {type: 'f', value: analyser.maxDecibels}
			},
			vertexShader: [
				"precision highp float;",
				"uniform mat4 projectionMatrix;",
				"uniform mat4 modelViewMatrix;",
				"uniform float minDecibels;",
				"uniform float maxDecibels;",
				"attribute float position;",
				"attribute float amplitude;",
				"attribute vec2 uv;",
				"varying vec2 vuv;",
				"varying float vamplitude;",
				"varying float vposition;",
				"void main() {",
					"vuv = uv;",
					"float normalisedAmp = max(0.0, (amplitude - minDecibels) * (maxDecibels - minDecibels));",
					"vamplitude = normalisedAmp;",
					"vposition = position;",
					"gl_Position = projectionMatrix * modelViewMatrix * vec4(position * 20.0, normalisedAmp / 10.0 + 250.0, 0.0, 1.0);",
				"}"
			].join("\n"),
			fragmentShader: [
				"precision highp float;",
				"varying float vamplitude;",
				"varying float vposition;",
				"void main() {",
					"gl_FragColor = vec4(vamplitude / 5000.0, vposition / 90.0, 1.0 - vposition / 90.0, 1.0);",
				"}"
			].join("\n")
		});
		var line = this.line = new THREE.Line(geometry, material, THREE.LineStrip);
		line.frustumCulled = false;
		line.depthTest = false;
		line.depthWrite = false;
		this.scene.add(line);

		this.camera.position.set(0,0,1);

		requestAnimationFrame(this.visualise.bind(this));
	},
	playNote: function (note, frequency) {
		var oscillator = this.createOscillator(frequency);
		oscillator.connect(this.masterGain);
		oscillator.start();
		this.notes[note] = oscillator;
	},
	createOscillator: function (frequency) {
		return this.createOscillatorSimple(frequency);
		//return this.createOscillatorCustom(frequency);
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
		// TODO: figure a solution for the rounding problem
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
		var buffer = this.line.geometry.attributes.amplitude.array;
		analyser.getFloatFrequencyData(buffer);
		this.line.geometry.attributes.amplitude.needsUpdate = true;

		/*var texture = this.quad.material.uniforms.fft.value;
		if (!texture) {
			var size = Math.sqrt(buffer.length);
			texture = new THREE.DataTexture(buffer, size, size,
				THREE.LuminanceFormat, THREE.UnsignedByteType, THREE.Texture.DEFAULT_MAPPING,
				THREE.ClampToEdgeWrapping, THREE.ClampToEdgeWrapping, THREE.LinearFilter, THREE.LinearFilter
			);
			this.quad.material.uniforms.fft.value = texture;
		}
		else {
			texture.image.data = buffer;
		}
		texture.needsUpdate = true;*/

		this.renderer.render(this.scene, this.camera);
	}
});
