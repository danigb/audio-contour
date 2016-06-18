# audio-contour [![npm](https://img.shields.io/npm/v/audio-contour.svg?style=flat-square)](https://www.npmjs.com/package/audio-contour)

[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/feross/standard) [![license](https://img.shields.io/npm/l/audio-contour.svg?style=flat-square)](https://www.npmjs.com/package/audio-contour)

A 5 stage audio envelope generator. You can see the **[demo here](https://danigb.github.io/audio-contour/example)**:

```js
var Contour = require('audio-contour')
var ac = new AudioContext()

var vca = ac.createGain()
var osc = ac.createOscillator()
osc.connect(vca)

var env = Contour(ac, { t1: 0.2, t4: 0.5 })
env.connect(vca.gain)

env.start()
env.onstart = function (when) { osc.start(when) }
env.onended = function () { osc.stop() }
env.stop(ac.currentTime + 3)
```

This module implements a alpha-juno style envelope generator:

![Envelope Diagram from audiorealism.se](env.png?raw=true)

If you want to learn more about envelope generators, read [this](https://github.com/micjamking/synth-secrets/blob/master/part-8.md)

There are a lot of envelope generator implementations. Here are the standalone ones I know (there are several audio libraries that implements them):

- https://github.com/mmckegg/adsr
- https://www.npmjs.com/package/adsr-envelope
- https://github.com/itsjoesullivan/envelope-generator

Why choose this library over the others:

- Unlike others, it implements a 5 stage envelope (and can be reduced to a standard ADSR envelope)
- It supports `onstart` and `onended` events
- Can specify gate duration (for sequencer style)
- It's small (2.5Kb minified)

Why don't choose this library:

- It's very young project, still in development and not battle tested.
- Other libraries are great too!

## Installation

Via npm: `npm i --save audio-contour`

## Usage

**Create an envelope**

To create an envelope use the `Contour` function:

```js
var ac = new AudioContext()
var Contour = require('audio-contour')
var env = Contour(ac)
```

You can pass options to that function:

```js
var env = Contour(ac, { t1: 1 })
```

or change them on the object **before** start:

```js
var env = Contour(ac)
env.t1 = 1
env.t4 = 0.5
```

**Apply the envelope**

To apply the envelope, you have to connect it to something. For example, you can create a vca (voltage controlled amplifier) connecting it to a gain's gain param:

```js
var vca = ac.createGain()
env.connect(vca.gain)
```

Or create a vcf (voltage controlled filter) ocnnecting it to a filter frequency param:

```js
var vcf = ac.createBiquadFilter()
env.connect(vcf.frequency)
```

**Start and stop the envelope**

You can use `start` and `stop` function to the envelope:

```js
var now = ac.currentTime
env.start(now)
// suppose your audio source is an oscillator
osc.start(now)
var finish = env.stop(now + 1)
```

The `stop` function returns the time when the release phase ended. Can be used to stop the audio sources:

```js
osc.start(finish)
```

Remeber that **if duration is not `Infinity`, the envelope will stop automatically**:

```js
var env = Contour(ac)
env.duration = 1
env.start() // => it will automatically stop after 1 second
```

**Events**

Two events are supported: `onstart` and `onended`. The `onstart` event handler will be trigger at same time as the `start` function of the envelope, so it receives a time parameter. The `onended` event handler will be called when the envelope effectively stops:

```js
env.duration = 1
env.onstart = function (when) { osc.start(when) }
env.onended = function () { osc.stop(ac.currentTime) }
env.start() // since duration is not Infinity, both envent handlers will be called
```

**Create a standard ADSR**

When `t3` is 0, the audio-contour behaves like a normal ADSR envelope.

Additionally, you can use the standard `attack`, `decay`, `sustain` and `release` parameters in the constructor to build the envelope:

```js
var env = Contour(ac, { attack: 0.1, decay: 0.2, sustain: 0.8, release: 0.5 })
env.t1 // => 0.1 (the attack)
env.t2 // => 0.2 (the decay)
env.t3 // => 0
env.t4 // => 0.5 (the release)
```

## Run tests and examples

To run the tests, clone this repo and: `npm install && npm test`.

To run the example you need watchify installed: `npm install -g watchify`. Then, move to `examples` directory and type: `npm install && npm start`


## License

MIT License
