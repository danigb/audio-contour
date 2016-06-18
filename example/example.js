/* global AudioContext OfflineAudioContext */
var Contour = require('..')
var wave = require('draw-wave')
var Noise = require('noise-buffer')
var adsr = require('adsr')

var buffer = Noise(3)
wave.canvas(canvas(), buffer, '#52F6A4')
render(contour, '#A452F6')
render(adsrEnv, '#F6A452')

function contour (ac) {
  var g = gain(ac, 0, ac.destination)
  var env = Contour(ac, {
    ramp: 'exp', duration: 0.2,
    t1: 0.1, l1: 1, t2: 0.3, l2: 0.1, t3: 0.3, t4: 5
  })
  env.connect(g.gain)
  var s = source(ac, Noise(3), g)
  env.start(0)
  s.start(0)
}

function adsrEnv (ac) {
  var g = gain(ac, 0, ac.destination)
  var env = adsr(ac)
  env.attack = 0.5
  env.decay = 0.2
  env.sustain = 0.4
  env.connect(g.gain)
  var s = source(ac, Noise(3), g)
  env.start(0)
  s.start()
}

function render (env, color) {
  var off = new OfflineAudioContext(buffer.numberOfChannels,
    buffer.duration * buffer.sampleRate, buffer.sampleRate)
  console.log('Create context', off)
  env(off)
  off.startRendering().then(function (buffer) {
    wave.canvas(canvas(), buffer, color)
  })
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

function canvas () {
  var canvas = document.createElement('canvas')
  canvas.width = 960
  canvas.height = 200
  document.body.appendChild(canvas)
  return canvas
}
