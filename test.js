/* global AudioContext */
require('web-audio-test-api')
var test = require('tape')
var Contour = require('.')

test('5 stage envelope', function (t) {
  var ac = new AudioContext()
  var env = Contour(ac)
  t.ok(env)
  t.end()
})

test('set options', function (t) {
  var ac = new AudioContext()
  var env = Contour(ac, { ramp: 'linear', duration: 100,
    t1: 1, t2: 2, t3: 3, t4: 4, l1: 10, l2: 20, l3: 30 })
  assertOptions(t, env, 'linear', 100, 1, 2, 3, 4, 10, 20, 30)
  t.end()
})

test('ignore invalid options', function (t) {
  var ac = new AudioContext()
  var env = Contour(ac, { ramp: 'blah', color: 'blue' })
  t.equal(env.color, undefined)
  t.end()
})

test('set adsr options', function (t) {
  var ac = new AudioContext()
  var env = Contour(ac, { attack: 0.1, decay: 0.2, sustain: 0.8, release: 0.5 })
  assertOptions(t, env, 'linear', Infinity, 0.1, 0.2, 0, 0.5, 1, 0.2, 0.8)
  t.end()
})

test('onstart event', function (t) {
  var ac = new AudioContext()
  var times = 0
  var env = Contour(ac)
  env.onstart = function () { times++ }
  env.start()
  t.equal(times, 1)
  t.end()
})

var assertOptions = function (t, env, r, d, t1, t2, t3, t4, l1, l2, l3) {
  t.equal(env.ramp, r)
  t.equal(env.duration, d)
  t.equal(env.t1, t1)
  t.equal(env.t2, t2)
  t.equal(env.t3, t3)
  t.equal(env.t4, t4)
  t.equal(env.l1, l1)
  t.equal(env.l2, l2)
  t.equal(env.l3, l3)
}
