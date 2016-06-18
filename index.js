'use strict'

var DEFAULTS = {
  ramp: 'linear', duration: Infinity,
  l1: 1, l2: 0.8, l3: 0.6,
  t1: 0.01, t2: 0.1, t3: 0, t4: 0.2
}

module.exports = function Envelope (ac, options) {
  var opts = options ? Object.assign({}, DEFAULTS, options) : DEFAULTS
  var env = ac.createGain()
  var tail = ac.createGain()
  tail.connect(env)
  var head = ac.createGain()
  head.connect(tail)
  var cv = createCV(ac)
  cv.connect(head)
  var linear = opts.ramp === 'linear'

  env.start = function (time) {
    time = Math.max(time || 0, ac.currentTime)
    cv.start(time)
    head.gain.setValueAtTime(0, time)
    head.gain.setValueAtTime(0.01, time + 0.000001)
    ramp(head, opts.l1, time + opts.t1)
    ramp(head, opts.l2, time + opts.t1 + opts.t2)
    ramp(head, opts.l3, time + opts.t1 + opts.t2 + opts.t3)
    if (isFinite(opts.duration)) env.stop(time + opts.duration)
  }
  env.stop = function (time) {
    time = Math.max(time || 0, ac.currentTime)
    tail.gain.cancelScheduledValues(time)
    tail.gain.setValueAtTime(env.gain.value, time)
    var endsAt = time + opts.t4
    ramp(tail, 0.0001, endsAt)
    if (env.onended) {
      var osc = ac.createOscillator()
      osc.onended = env.onended
      osc.start()
      osc.stop(endsAt)
    }
    return endsAt
  }
  return env

  function ramp (n, level, time) {
    console.log('ramp!', level, time, linear)
    linear ? n.gain.linearRampToValueAtTime(level, time)
    : n.gain.exponentialRampToValueAtTime(level, time)
  }
}

function createCV (ac) {
  var buffer = ac.createBuffer(1, 2, ac.sampleRate)
  var data = buffer.getChannelData(0)
  data[0] = data[1] = 1
  var source = ac.createBufferSource()
  source.buffer = buffer
  source.loop = true
  return source
}
