/* global AudioContext OfflineAudioContext */
/* global nx dt1 dt2 dt3 dt4 dl1 dl2 dl3 button1, selectRamp */
var ac = new AudioContext()
var Contour = require('..')
var wave = require('draw-wave')
var Noise = require('noise-buffer')

var params = ['l1', 'l2', 'l3', 't1', 't2', 't3', 't4']
var buffer = Noise(3)
var rendered = null
var canvas = document.querySelector('.wave')
var current = { duration: 1, ramp: 'exponential', t1: 0.1, t3: 0, t4: 1 }
var timestamp = null

function set (dial, value) { dial.val = { value: value }; dial.init() }

nx.onload = function () {
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
    if (e.press) source(ac, rendered, ac.destination).start()
  })
  selectRamp.value = { text: 'linear' }
  selectRamp.on('*', function (e) {
    current['ramp'] = e.text
    update()
  })
  update()
}

function update (when) {
  setTimeout(function () {
    if (!when || when === timestamp) render(current, canvas, '#52F6A4')
  }, 100)
}

function render (current, canvas, color) {
  console.log('render', current)
  var off = new OfflineAudioContext(buffer.numberOfChannels,
    buffer.duration * buffer.sampleRate, buffer.sampleRate)
  var g = gain(off, 0, off.destination)
  var env = Contour(off, current)
  env.connect(g.gain)
  var s = source(off, Noise(3), g)
  env.start(0)
  s.start(0)
  off.startRendering().then(function (buffer) {
    rendered = buffer
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
