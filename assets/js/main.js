/* skel-baseline v3.0.1 | (c) n33 | skel.io | MIT licensed */

(function () {

	"use strict";

	// utls
	const { PI, cos, sin, abs, sqrt, pow, round, random, atan2 } = Math;
	const HALF_PI = 0.5 * PI;
	const TAU = 2 * PI;
	const TO_RAD = PI / 180;
	const CHANGE_HUE = false;
	const floor = n => n | 0;
	const rand = n => n * random();
	const randIn = (min, max) => rand(max - min) + min;
	const randRange = n => n - rand(2 * n);
	const fadeIn = (t, m) => t / m;
	const fadeOut = (t, m) => (m - t) / m;
	const fadeInOut = (t, m) => {
		let hm = 0.5 * m;
		return abs((t + hm) % m - hm) / (hm);
	};
	const dist = (x1, y1, x2, y2) => sqrt(pow(x2 - x1, 2) + pow(y2 - y1, 2));
	const angle = (x1, y1, x2, y2) => atan2(y2 - y1, x2 - x1);
	const lerp = (n1, n2, speed) => (1 - speed) * n1 + speed * n2;

	// shift
	const circleCount = 120;//150;
	const circlePropCount = 8;
	const circlePropsLength = circleCount * circlePropCount;
	const baseSpeed = 0.05;//0.1;
	const rangeSpeed = 0.5;//1;
	const baseTTL = 300;//150;
	const rangeTTL = 400;//200;
	const baseRadius = 10;//100;
	const rangeRadius = 150;
	const rangeHue = 15;//60;
	const xOff = 0.00015;
	const yOff = 0.00015;
	const zOff = 0.015;//0.0015;
	const blurPower = 100;
	const backgroundColor = 'hsla(248,78%,16%,1)';

	let container;
	let canvas;
	let ctx;
	let circles;
	let circleProps;
	let simplex;
	let baseHue;

	function setup() {
		createCanvas();
		resize();
		initCircles();
		draw();
	}

	function initCircles() {
		circleProps = new Float32Array(circlePropsLength);
		simplex = new SimplexNoise();
		baseHue = 248;

		let i;

		for (i = 0; i < circlePropsLength; i += circlePropCount) {
			initCircle(i);
		}
	}

	function initCircle(i) {
		let x, y, n, t, speed, vx, vy, life, ttl, radius, hue;

		x = rand(canvas.a.width);
		y = randomYinZone();
		n = simplex.noise3D(x * xOff, y * yOff, baseHue * zOff);
		t = rand(TAU);
		speed = baseSpeed + rand(rangeSpeed);
		vx = speed * cos(t);
		vy = speed * sin(t);
		life = 0;
		ttl = baseTTL + rand(rangeTTL);
		radius = baseRadius + rand(rangeRadius);
		hue = baseHue + n * rangeHue;

		circleProps.set([x, y, vx, vy, life, ttl, radius, hue], i);
	}

	function randomYinZone() {
		let y, firstZone, secondZone, zoneSize = canvas.a.height / 4;

		firstZone = randIn(0, zoneSize - zoneSize / 3);
		secondZone = randIn((zoneSize * 3) + zoneSize / 3, canvas.a.height);

		return Math.random() > 0.5 ? firstZone : secondZone;
	}

	function updateCircles() {
		let i;

		if (CHANGE_HUE) baseHue++;

		for (i = 0; i < circlePropsLength; i += circlePropCount) {
			updateCircle(i);
		}
	}

	function updateCircle(i) {
		let i2 = 1 + i, i3 = 2 + i, i4 = 3 + i, i5 = 4 + i, i6 = 5 + i, i7 = 6 + i, i8 = 7 + i;
		let x, y, vx, vy, life, ttl, radius, hue;

		x = circleProps[i];
		y = circleProps[i2];
		vx = circleProps[i3];
		vy = circleProps[i4];
		life = circleProps[i5];
		ttl = circleProps[i6];
		radius = circleProps[i7];
		hue = circleProps[i8];

		drawCircle(x, y, life, ttl, radius, hue);

		life++;

		circleProps[i] = x + vx;
		circleProps[i2] = y + vy;
		circleProps[i5] = life;

		(checkBounds(x, y, radius) || life > ttl) && initCircle(i);
	}

	function drawCircle(x, y, life, ttl, radius, hue) {
		ctx.a.save();
		ctx.a.fillStyle = `hsla(${hue},86%,27%,${fadeInOut(life, ttl)})`;
		// hsla 248, 86%, 27%, 1
		ctx.a.beginPath();
		ctx.a.arc(x, y, radius, 0, TAU);
		ctx.a.fill();
		ctx.a.closePath();
		ctx.a.restore();
	}

	function checkBounds(x, y, radius) {
		return (
			x < -radius ||
			x > canvas.a.width + radius ||
			y < -radius ||
			y > canvas.a.height + radius
		);
	}

	function createCanvas() {
		container = document.querySelector('.content--canvas');
		canvas = {
			a: document.createElement('canvas'),
			b: document.createElement('canvas')
		};
		canvas.b.style = `
			position: fixed;
			top: 0;
			left: 0;
			width: 100vw;
			height: 100vh;
			filter: blur(55px);
  			-webkit-filter: blur(${blurPower}px);
  			-moz-filter: blur(${blurPower}px);
  			-o-filter: blur(${blurPower}px);
  			-ms-filter: blur(${blurPower}px);
		`;
		container.appendChild(canvas.b);
		ctx = {
			a: canvas.a.getContext('2d'),
			b: canvas.b.getContext('2d')
		};
	}

	function resize() {
		const { innerWidth, innerHeight } = window;

		canvas.a.width = innerWidth;
		canvas.a.height = innerHeight;

		ctx.a.drawImage(canvas.b, 0, 0);

		canvas.b.width = innerWidth;
		canvas.b.height = innerHeight;

		ctx.b.drawImage(canvas.a, 0, 0);
	}

	function render() {
		ctx.b.save();
		//ctx.b.filter = 'blur(' + blurPower + 'px)';//'blur(50px)';
		ctx.b.drawImage(canvas.a, 0, 0);
		ctx.b.restore();
	}

	function draw() {
		ctx.a.clearRect(0, 0, canvas.a.width, canvas.a.height);
		ctx.b.fillStyle = backgroundColor;
		ctx.b.fillRect(0, 0, canvas.b.width, canvas.b.height);
		updateCircles();
		render();
		window.requestAnimationFrame(draw);
	}

	window.addEventListener('load', setup);
	window.addEventListener('resize', resize);

	//simple settings masked biuro(a)beio(dot)pl
	// use atob()
	var emailHref = "bWFpbHRvOmJpdXJvQGJlaW8ucGw=";
	var emailText = "Yml1cm9AYmVpby5wbA==";

	// Methods/polyfills.

	// addEventsListener
	var addEventsListener = function (o, t, e) { var n, i = t.split(" "); for (n in i) o.addEventListener(i[n], e) }

	// classList | (c) @remy | github.com/remy/polyfills | rem.mit-license.org
	!function () { function t(t) { this.el = t; for (var n = t.className.replace(/^\s+|\s+$/g, "").split(/\s+/), i = 0; i < n.length; i++)e.call(this, n[i]) } function n(t, n, i) { Object.defineProperty ? Object.defineProperty(t, n, { get: i }) : t.__defineGetter__(n, i) } if (!("undefined" == typeof window.Element || "classList" in document.documentElement)) { var i = Array.prototype, e = i.push, s = i.splice, o = i.join; t.prototype = { add: function (t) { this.contains(t) || (e.call(this, t), this.el.className = this.toString()) }, contains: function (t) { return -1 != this.el.className.indexOf(t) }, item: function (t) { return this[t] || null }, remove: function (t) { if (this.contains(t)) { for (var n = 0; n < this.length && this[n] != t; n++); s.call(this, n, 1), this.el.className = this.toString() } }, toString: function () { return o.call(this, " ") }, toggle: function (t) { return this.contains(t) ? this.remove(t) : this.add(t), this.contains(t) } }, window.DOMTokenList = t, n(Element.prototype, "classList", function () { return new t(this) }) } }();

	// Vars.
	var $body = document.querySelector('body');
	var logoShape1 = document.getElementById('logoClipPath');
	var logoShape2 = document.getElementById('logoBeioShape');

	// Breakpoints.
	skel.breakpoints({
		xlarge: '(max-width: 1680px)',
		large: '(max-width: 1280px)',
		medium: '(max-width: 980px)',
		small: '(max-width: 736px)',
		xsmall: '(max-width: 480px)'
	});

	// Disable animations/transitions until everything's loaded.
	$body.classList.add('is-loading');

	window.addEventListener('load', function () {
		$body.classList.remove('is-loading');

		let $mails = document.querySelectorAll(".letters_here");

		$mails.forEach(function (itm, indx) {
			itm.setAttribute('href', atob(emailHref));
			itm.setAttribute('target', '_blank');
			itm.innerHTML = atob(emailText);
		});

	});


	// Event: Hide nav on body click/tap.
	addEventsListener($body, 'mousemove', function (event) {

		logoShape1.setAttribute('style', `transform: translate(${event.clientX / -100}px, ${event.clientY / -60}px);`);
		logoShape2.setAttribute('style', `transform: translate(${event.clientX / -25}px, ${event.clientY / -15}px);`);
	});



})();
