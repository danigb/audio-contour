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
