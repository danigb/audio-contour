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
