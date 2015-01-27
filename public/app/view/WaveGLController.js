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
		this.audioContext = new AudioContext();

		var masterGain = this.masterGain = this.audioContext.createGain();
		masterGain.gain.value = 0.1;
		masterGain.connect(this.audioContext.destination);
	},
	initVisualiser: function () {
		var ctx = this.audioContext;
		var analyser = this.analyser = ctx.createAnalyser();
		// shim analyser between master gain and destination
		this.masterGain.connect(analyser);
		analyser.connect(ctx.destination);
		analyser.fftSize = 2048;
		analyser.smoothingTimeConstant = 0.2;
		analyser.buffer = new Uint8Array(analyser.frequencyBinCount);

		var view = this.getView();
		var width = view.getWidth();
		var height = view.getHeight();
		this.scene = new THREE.Scene();
		this.camera = new THREE.OrthographicCamera(0, width, height, 0, 0.1, 100);
		this.renderer = new THREE.WebGLRenderer({
			canvas: this.lookupReference('visualiser').getEl().dom
		});
		this.renderer.setSize(width, height);

		var geometry = new THREE.PlaneBufferGeometry(width, height);
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
		mesh.frustumCulling = false;
		mesh.depthTest = false;
		mesh.depthWrite = false;

		this.scene.add(mesh);
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
		var buffer = analyser.buffer;
		analyser.getByteFrequencyData(buffer);

		var texture = this.quad.material.uniforms.fft.value;
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
		texture.needsUpdate = true;

		this.renderer.render(this.scene, this.camera);
	}
});
