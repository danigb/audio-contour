# audio-contour [![npm](https://img.shields.io/npm/v/audio-contour.svg?style=flat-square)](https://www.npmjs.com/package/audio-contour)

[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/feross/standard) [![license](https://img.shields.io/npm/l/audio-contour.svg?style=flat-square)](https://www.npmjs.com/package/audio-contour)

A 5 stage audio envelope generator:

```js
var Contour = require('audio-contour')
var ac = new AudioContext()

var vca = ac.createGain()
var osc = ac.createOscillator()
osc.connect(vca)

var env = Contour(ac)
env.connect(vca.gain)

env.start()
osc.start()
env.onended = function () {
  osc.stop()
}
env.stop(ac.currentTime + 3)
```

This module implements a alpha-juno style envelope generator:

![Envelope Diagram from audiorealism.se](env.png?raw=true)

If you want to learn more about envelope generators, read [this](https://github.com/micjamking/synth-secrets/blob/master/part-8.md)

There are a lot of envelope generator implementations:

- https://github.com/mmckegg/adsr
- https://www.npmjs.com/package/adsr-envelope
- https://github.com/itsjoesullivan/envelope-generator

Why choose this:

- Unlike others, it implements a 5 stage envelope (and can be reduced to 4, 3 or 2 stages)
- It supports `onended` event
- Can specify gate duration (for sequencer style)
- It's small

Why don't choose this:

- It's still in development

## Installation

Via npm: `npm i --save audio-contour`

## Usage



## License MIT
