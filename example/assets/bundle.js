(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/* global AudioContext OfflineAudioContext */
/* global nx dt1 dt2 dt3 dt4 dl1 dl2 dl3 button1, selectRamp */
var ac = new AudioContext()
var Contour = require('..')
var wave = require('draw-wave')
var Noise = require('noise-buffer')
var COLOR = '#70B7FD'

var params = ['l1', 'l2', 'l3', 't1', 't2', 't3', 't4']
var buffer = Noise(3)
var canvas = document.querySelector('.wave')
var code = document.querySelector('#config')
var current = { ramp: 'exponential', t1: 0.1, t3: 0, t4: 1 }
var timestamp = null

function set (dial, value) { dial.val = { value: value }; dial.init() }

nx.onload = function () {
  nx.colorize(COLOR)
  var defaults = Contour.params(current)
  var dials = [dl1, dl2, dl3, dt1, dt2, dt3, dt4]
  params.map(function (name, i) {
    current[name] = defaults[name]
    dials[i].on('*', function (e) {
      current[name] = e.value
      timestamp = Date.now()
      update(timestamp)
    })
    set(dials[i], current[name])
  })
  button1.on('*', function (e) {
    if (e.press) play(ac, current)
  })
  selectRamp.value = { text: 'linear' }
  selectRamp.on('*', function (e) {
    current['ramp'] = e.text
    update()
  })
  update()
}

function play (ac, current) {
  var vca = gain(ac, 0, ac.destination)
  var env = Contour(ac, current)
  env.duration = 1
  env.connect(vca.gain)
  env.onstart = function (t) { console.log('Started', t) }
  env.onended = function () { console.log('Ended', ac.currentTime) }
  var s = source(ac, Noise(3), vca)
  env.start()
  s.start()
}

function update (when) {
  var params = JSON.stringify(current)
    .replace(/\"\:/g, ': ').replace(/,\"/g, ', ').replace('"ramp', 'ramp')
  code.innerHTML = 'var ac = new AudioContext()\nvar env = Contour(ac, ' + params + ')'
  setTimeout(function () {
    if (!when || when === timestamp) drawCanvas(current, canvas, COLOR)
  }, 100)
}

function drawCanvas (current, canvas, color) {
  var off = new OfflineAudioContext(buffer.numberOfChannels,
    buffer.duration * buffer.sampleRate, buffer.sampleRate)
  var g = gain(off, 0, off.destination)
  var env = Contour(off, current)
  env.duration = 1
  env.connect(g.gain)
  var s = source(off, Noise(3), g)
  env.start(0)
  s.start(0)
  off.startRendering().then(function (buffer) {
    clearCanvas(canvas)
    wave.canvas(canvas, buffer, color)
  })
}

function clearCanvas (canvas) {
  var ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, canvas.width, canvas.height)
}

function source (ac, buffer, dest) {
  var source = ac.createBufferSource()
  source.buffer = buffer
  source.connect(dest)
  return source
}

function gain (ac, value, dest) {
  var gain = ac.createGain()
  gain.gain.value = value
  gain.connect(dest)
  return gain
}

},{"..":7,"draw-wave":2,"noise-buffer":6}],2:[function(require,module,exports){
module.exports = {
  canvas: drawBuffer,
  svg: require('./svg.js')
};

function drawBuffer (canvas, buffer, color) {
  var ctx = canvas.getContext('2d');
  var width = canvas.width;
  var height = canvas.height;
  if (color) {
    ctx.fillStyle = color;
  }

    var data = buffer.getChannelData( 0 );
    var step = Math.ceil( data.length / width );
    var amp = height / 2;
    for(var i=0; i < width; i++){
        var min = 1.0;
        var max = -1.0;
        for (var j=0; j<step; j++) {
            var datum = data[(i*step)+j];
            if (datum < min)
                min = datum;
            if (datum > max)
                max = datum;
        }
      ctx.fillRect(i,(1+min)*amp,1,Math.max(1,(max-min)*amp));
    }
}
},{"./svg.js":5}],3:[function(require,module,exports){
var has = require('has');

module.exports = function (name, attr) {
    var elem = document.createElementNS('http://www.w3.org/2000/svg', name);
    if (!attr) return elem;
    for (var key in attr) {
        if (!has(attr, key)) continue;
        var nkey = key.replace(/([a-z])([A-Z])/g, function (_, a, b) {
            return a + '-' + b.toLowerCase();
        });
        elem.setAttribute(nkey, attr[key]);
    }
    return elem;
}

},{"has":4}],4:[function(require,module,exports){
var hasOwn = Object.prototype.hasOwnProperty;


module.exports = function has(obj, property) {
  return hasOwn.call(obj, property);
};

},{}],5:[function(require,module,exports){
var createEl = require('svg-create-element');

module.exports = drawBufferSVG;

function getRect(x, y, width, height, color) {
  return createEl('rect', {
    x: x,
    y: y,
    width: width,
    height: height,
    fill: color
  });
}

function drawBufferSVG(buffer, width, height, color) {
  if (!color) color = '#000';

  var svgEl = createEl('svg', {
    width: width,
    height: height
  });

  svgEl.style.display = "block";

  var g = createEl('g');

  svgEl.appendChild(g);

  var data = buffer.getChannelData( 0 );
  var step = Math.ceil( data.length / width );
  var amp = height / 2;
  for (var i=0; i < width; i++) {
    var min = 1.0;
    var max = -1.0;
    for (var j=0; j<step; j++) {
      var datum = data[(i*step)+j];
      if (datum < min)
        min = datum;
      if (datum > max)
        max = datum;
    }
    g.appendChild(getRect(i, (1+min)*amp, 1, Math.max(1,(max-min)*amp), color));
  }

  return svgEl;
}
},{"svg-create-element":3}],6:[function(require,module,exports){
// courtesy of http://noisehack.com/generate-noise-web-audio-api/
module.exports = function(length, type) {
  type = type || 'white';

  var sampleRate = 44100;
  var samples = length * sampleRate;
  var context = new (window.OfflineAudioContext || window.webkitOfflineAudioContext)(1, samples, sampleRate);
  var noiseBuffer = context.createBuffer(1, samples, sampleRate);
  var output = noiseBuffer.getChannelData(0);

  switch(type) {
    case 'white':
      // http://noisehack.com/generate-noise-web-audio-api/
      for (var i = 0; i < samples; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      break;
    case 'pink':
      // just completely http://noisehack.com/generate-noise-web-audio-api/
      var b0, b1, b2, b3, b4, b5, b6;
      b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0;
      for (var i = 0; i < samples; i++) {
        var white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        output[i] *= 0.11; // (roughly) compensate for gain
        b6 = white * 0.115926;
      }
      break;
    case 'brown':
      // just completely http://noisehack.com/generate-noise-web-audio-api/
      var lastOut = 0.0;
      for (var i = 0; i < samples; i++) {
        var white = Math.random() * 2 - 1;
        output[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5; // (roughly) compensate for gain
      }
      break;
  }

  return noiseBuffer;
};

},{}],7:[function(require,module,exports){
'use strict'
var Voltage = require('voltage-source-node')
var isNum = function (n) { return typeof n === 'number' }

var NUMS = ['duration', 't1', 't2', 't3', 't4', 'l1', 'l2', 'l3']
var DEFAULTS = {
  duration: Infinity, l1: 1, l2: 0.2, l3: 0.8,
  t1: 0.01, t2: 0.1, t3: 0, t4: 0.2
}

function rampFn (l) {
  return l ? 'linearRampToValueAtTime' : 'exponentialRampToValueAtTime'
}
function ramp (l, node, level, time) { node.gain[rampFn(l)](level, time) }

/**
 * Create an envelope generator.
 * @param {AudioContext} ac - the audio context
 * @param {Object} options - (Optional) the envelope options
 * @return {AudioNode} the envelope generator node
 */
function Contour (ac, options) {
  var env = ac.createGain()
  var opts = Contour.params(options, env)
  var isL = opts.ramp === 'linear'

  var tail = ac.createGain()
  tail.connect(env)
  var head = ac.createGain()
  head.connect(tail)
  var cv = Voltage(ac)
  cv.connect(head)

  env.start = function (time) {
    time = Math.max(time || 0, ac.currentTime)
    if (env.onstart) env.onstart(time)
    cv.start(time)
    head.gain.setValueAtTime(0, time)
    head.gain.setValueAtTime(0.01, time + 0.000001)
    ramp(isL, head, opts.l1, time + opts.t1)
    ramp(isL, head, opts.l2, time + opts.t1 + opts.t2)
    ramp(isL, head, opts.l3, time + opts.t1 + opts.t2 + opts.t3)
    if (isFinite(opts.duration)) env.stop(time + opts.duration)
  }

  env.stop = function (time) {
    time = Math.max(time || 0, ac.currentTime)
    tail.gain.cancelScheduledValues(time)
    tail.gain.setValueAtTime(env.gain.value, time)
    var endsAt = time + opts.t4
    ramp(isL, tail, 0.0001, endsAt)
    if (env.onended) {
      var s = Voltage(ac, 0)
      s.connect(ac.destination)
      s.onended = env.onended
      s.start(ac.currentTime)
      s.stop(endsAt)
    }
    return endsAt
  }
  return env
}

Contour.params = function (options, dest) {
  dest = dest || {}
  options = options || {}
  NUMS.forEach(function (name) {
    dest[name] = isNum(options[name]) ? options[name] : DEFAULTS[name]
  })
  if (isNum(options.attack)) dest.t1 = options.attack
  if (isNum(options.decay)) dest.t2 = options.decay
  if (isNum(options.sustain)) dest.l3 = options.sustain
  if (isNum(options.release)) dest.t4 = options.release
  dest.ramp = options.ramp === 'exponential' ? options.ramp : 'linear'
  return dest
}

module.exports = Contour

},{"voltage-source-node":8}],8:[function(require,module,exports){
'use strict'

module.exports = function (ac, value) {
  value = (value || value === 0) ? value : 1
  var buffer = ac.createBuffer(1, 2, ac.sampleRate)
  var data = buffer.getChannelData(0)
  data[0] = data[1] = value
  var source = ac.createBufferSource()
  source.buffer = buffer
  source.loop = true
  return source
}

},{}]},{},[1]);
