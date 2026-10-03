#!/usr/bin/env node
//
// Checks that the browser bundles rollup just produced still expose what a
// script-tag consumer loads them for.
//
// This exists because a bundle can be built successfully and still be wrong.
// @rollup/plugin-commonjs changed its default to wrapping CommonJS modules,
// whose exports cannot then be read statically, and the bundle quietly came out
// with nothing on it but a synthetic `default` — no QRCode.create, no
// QRCode.toDataURL. Nothing failed. The package would simply have shipped a
// QRCode global that did nothing.

const fs = require('fs')
const path = require('path')
const vm = require('vm')

const BUILD = path.join(__dirname, '..', 'build')
const EXPECTED = ['create', 'toCanvas', 'toDataURL', 'toString']

function load () {
  // The bundles are IIFEs written for a browser: one assigns the QRCode global,
  // the other hangs toSJIS off it. A VM context with the globals they actually
  // touch is enough to execute both and inspect the result.
  const context = vm.createContext({ TextEncoder, Uint8Array, Math, Object, Error, Promise, Array, String, Number, isNaN, parseInt })

  const main = fs.readFileSync(path.join(BUILD, 'qrcode.js'), 'utf8')
  // `var QRCode = ...` declares inside the context rather than assigning to it.
  vm.runInContext(main.replace(/^var QRCode=/, 'this.QRCode='), context)
  vm.runInContext(fs.readFileSync(path.join(BUILD, 'qrcode.tosjis.js'), 'utf8'), context)

  return context.QRCode
}

function main () {
  const QRCode = load()

  const missing = EXPECTED.filter((name) => typeof QRCode[name] !== 'function')
  if (missing.length) {
    throw new Error(
      `build/qrcode.js is missing ${missing.join(', ')} — it exposes ${Object.keys(QRCode).join(', ')}`
    )
  }
  if (typeof QRCode.toSJIS !== 'function') {
    throw new Error('build/qrcode.tosjis.js did not add QRCode.toSJIS')
  }

  // And that it works, not merely that the names are present.
  const qr = QRCode.create('hello world', { errorCorrectionLevel: 'M' })
  if (qr.modules.size !== 21) {
    throw new Error(`expected a 21-module version 1 symbol, got ${qr.modules.size}`)
  }

  const kanji = QRCode.create('あいう', { toSJISFunc: QRCode.toSJIS })
  if (kanji.segments[0].mode.id !== 'Kanji') {
    throw new Error(`toSJIS did not enable kanji mode, got ${kanji.segments[0].mode.id}`)
  }

  console.log(`build verified: QRCode exposes ${Object.keys(QRCode).sort().join(', ')}`)
}

main()
