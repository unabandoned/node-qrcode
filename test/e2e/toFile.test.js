const test = require('tap').test
const fs = require('fs')
const path = require('path')
const os = require('os')
const sinon = require('sinon')
const { PNG } = require('pngjs')
const QRCode = require('lib')
const Utils = require('lib/renderer/utils')
const Helpers = require('test/helpers')
const StreamMock = require('test/mocks/writable-stream')

// ONE FILE PER WRITE, AND ONE WRITE AT A TIME.
//
// Every test here used to fire three or four toFile() calls at a single path in
// os.tmpdir() without waiting for any of them, then read that path back. What a
// reader saw depended on which write happened to be in flight, so
// 'Should write correct content' failed at random — it was failing on Node 24
// while passing on Node 22 with identical code. Two tests shared qrimage.txt
// with each other on top of that, and the sinon stub that forces a write error
// was installed while real writes were still pending, so it could hijack one.
//
// Each test now gets its own directory, each call its own file, and each write
// finishes before the next begins.
const tmpdir = (prefix) => fs.promises.mkdtemp(path.join(os.tmpdir(), `qrcode-${prefix}-`))

// Resolves with whatever the callback was given, so the test can still assert on
// the error rather than having a rejection fail it from the outside.
const writeViaCallback = (file, text, options) => new Promise((resolve) => {
  if (options) QRCode.toFile(file, text, options, resolve)
  else QRCode.toFile(file, text, resolve)
})

const exists = (file) => fs.promises.stat(file).then(() => true, () => false)

const read = (file, encoding) => fs.promises.readFile(file, encoding)

// WHAT THIS PACKAGE IS RESPONSIBLE FOR, rather than what pngjs and zlib encode.
//
// This assertion used to compare the file against a base64 PNG captured from an
// earlier pngjs. That string is the encoder's output, not ours: any change to
// pngjs or to the zlib underneath it writes a valid, different PNG for the same
// pixels. So compare the PIXELS against the module matrix the core produced —
// the same approach toDataURL.test.js takes, for the same reason.
function writesTheQRCode (buffer, text, options) {
  const png = PNG.sync.read(buffer)
  const qr = QRCode.create(text, options)
  const opts = Utils.getOptions(options)
  const scale = Utils.getScale(qr.modules.size, opts)
  const size = Utils.getImageWidth(qr.modules.size, opts)

  if (png.width !== size || png.height !== size) return false

  for (let row = 0; row < qr.modules.size; row++) {
    for (let col = 0; col < qr.modules.size; col++) {
      // The centre of the module, so a pixel on an edge cannot decide it.
      const x = Math.floor((col + opts.margin) * scale + scale / 2)
      const y = Math.floor((row + opts.margin) * scale + scale / 2)
      const dark = png.data[(y * png.width + x) * 4] < 128
      if (dark !== Boolean(qr.modules.data[row * qr.modules.size + col])) return false
    }
  }
  return true
}

test('toFile - no promise available', function (t) {
  Helpers.removeNativePromise()
  const fileName = path.join(os.tmpdir(), 'qrimage.png')

  t.throws(function () { QRCode.toFile(fileName, 'some text') },
    'Should throw if a callback is not provided')

  t.throws(function () { QRCode.toFile(fileName, 'some text', {}) },
    'Should throw if a callback is not a function')

  t.end()

  Helpers.restoreNativePromise()
})

test('toFile', async function (t) {
  const dir = await tmpdir('args')
  const fileName = path.join(dir, 'qrimage.png')

  t.throws(function () { QRCode.toFile('some text', function () {}) },
    'Should throw if path is not provided')

  t.throws(function () { QRCode.toFile(fileName) },
    'Should throw if text is not provided')

  // Awaited, so the write it starts cannot outlive the test.
  const promise = QRCode.toFile(fileName, 'some text')
  t.equal(typeof promise.then, 'function',
    'Should return a promise')
  await promise
})

test('toFile png', async function (t) {
  const dir = await tmpdir('png')
  const text = 'i am a pony!'
  const options = { errorCorrectionLevel: 'L' }

  t.plan(8)

  const viaCallback = path.join(dir, 'callback.png')
  t.ok(!await writeViaCallback(viaCallback, text, options),
    'There should be no error')
  t.ok(await exists(viaCallback),
    'Should save file with correct file name')
  t.ok(writesTheQRCode(await read(viaCallback), text, options),
    'Should write correct content')

  const withType = path.join(dir, 'explicit-type.png')
  t.ok(!await writeViaCallback(withType, text, { ...options, type: 'png' }),
    'There should be no errors if file type is specified')

  const viaPromise = path.join(dir, 'promise.png')
  await QRCode.toFile(viaPromise, text, options)
  t.ok(await exists(viaPromise),
    'Should save file with correct file name (promise)')
  t.ok(writesTheQRCode(await read(viaPromise), text, options),
    'Should write correct content (promise)')

  // Only now that every real write has finished: a stub on fs.createWriteStream
  // is global, so installing it earlier could have broken one of them instead.
  // callsFake, not returns: a StreamMock errors once, so handing the same
  // instance to both calls leaves the second waiting for an event that has
  // already fired. The old test only got away with it by making both calls at
  // once, while the stream was still fresh.
  const fsStub = sinon.stub(fs, 'createWriteStream')
  fsStub.callsFake(() => new StreamMock().forceErrorOnWrite())
  try {
    t.ok(await writeViaCallback(path.join(dir, 'fails.png'), text, options),
      'There should be an error')
    await QRCode.toFile(path.join(dir, 'fails-promise.png'), text, options)
      .then(() => t.fail('Should have rejected'), (err) => t.ok(err, 'Should catch an error (promise)'))
  } finally {
    fsStub.restore()
  }
})

test('toFile svg', async function (t) {
  const dir = await tmpdir('svg')
  const text = 'http://www.google.com'
  const options = { errorCorrectionLevel: 'H' }
  const expectedOutput = fs.readFileSync(
    path.join(__dirname, '/svg.expected.out'), 'UTF-8')

  t.plan(6)

  const viaCallback = path.join(dir, 'callback.svg')
  t.ok(!await writeViaCallback(viaCallback, text, options),
    'There should be no error')
  t.ok(await exists(viaCallback),
    'Should save file with correct file name')
  t.equal(await read(viaCallback, 'utf8'), expectedOutput,
    'Should write correct content')

  const withType = path.join(dir, 'explicit-type.svg')
  t.ok(!await writeViaCallback(withType, text, { ...options, type: 'svg' }),
    'There should be no errors if file type is specified')

  const viaPromise = path.join(dir, 'promise.svg')
  await QRCode.toFile(viaPromise, text, options)
  t.ok(await exists(viaPromise),
    'Should save file with correct file name (promise)')
  t.equal(await read(viaPromise, 'utf8'), expectedOutput,
    'Should write correct content (promise)')
})

test('toFile utf8', async function (t) {
  const dir = await tmpdir('utf8')
  const text = 'http://www.google.com'
  const expectedOutput = [
    '                                 ',
    '                                 ',
    '    █▀▀▀▀▀█ █ ▄█  ▀ █ █▀▀▀▀▀█    ',
    '    █ ███ █ ▀█▄▀▄█ ▀▄ █ ███ █    ',
    '    █ ▀▀▀ █ ▀▄ ▄ ▄▀ █ █ ▀▀▀ █    ',
    '    ▀▀▀▀▀▀▀ ▀ ▀ █▄▀ █ ▀▀▀▀▀▀▀    ',
    '    ▀▄ ▀▀▀▀█▀▀█▄ ▄█▄▀█ ▄█▄██▀    ',
    '    █▄ ▄▀▀▀▄▄█ █▀▀▄█▀ ▀█ █▄▄█    ',
    '    █▄ ▄█▄▀█▄▄  ▀ ▄██▀▀ ▄  ▄▀    ',
    '    █▀▄▄▄▄▀▀█▀▀█▀▀▀█ ▀ ▄█▀█▀█    ',
    '    ▀ ▀▀▀▀▀▀███▄▄▄▀ █▀▀▀█ ▀█     ',
    '    █▀▀▀▀▀█ █▀█▀▄ ▄▄█ ▀ █▀ ▄█    ',
    '    █ ███ █ █ █ ▀▀██▀███▀█ ██    ',
    '    █ ▀▀▀ █  █▀ ▀ █ ▀▀▄██ ███    ',
    '    ▀▀▀▀▀▀▀ ▀▀▀  ▀▀ ▀    ▀  ▀    ',
    '                                 ',
    '                                 '].join('\n')

  t.plan(6)

  const viaCallback = path.join(dir, 'callback.txt')
  t.ok(!await writeViaCallback(viaCallback, text),
    'There should be no error')
  t.ok(await exists(viaCallback),
    'Should save file with correct file name')
  t.equal(await read(viaCallback, 'utf8'), expectedOutput,
    'Should write correct content')

  const withType = path.join(dir, 'explicit-type.txt')
  t.ok(!await writeViaCallback(withType, text, { errorCorrectionLevel: 'M', type: 'utf8' }),
    'There should be no errors if file type is specified')

  const viaPromise = path.join(dir, 'promise.txt')
  await QRCode.toFile(viaPromise, text)
  t.ok(await exists(viaPromise),
    'Should save file with correct file name (promise)')
  t.equal(await read(viaPromise, 'utf8'), expectedOutput,
    'Should write correct content (promise)')
})

test('toFile manual segments', async function (t) {
  const dir = await tmpdir('segments')
  const fileName = path.join(dir, 'qrimage.txt')
  const segs = [
    { data: 'ABCDEFG', mode: 'alphanumeric' },
    { data: '0123456', mode: 'numeric' }
  ]
  const expectedOutput = [
    '                             ',
    '                             ',
    '    █▀▀▀▀▀█ ██▀██ █▀▀▀▀▀█    ',
    '    █ ███ █  █▀█▄ █ ███ █    ',
    '    █ ▀▀▀ █ █ ▄ ▀ █ ▀▀▀ █    ',
    '    ▀▀▀▀▀▀▀ █▄█▄▀ ▀▀▀▀▀▀▀    ',
    '    ▀██ ▄▀▀▄█▀▀▀▀██▀▀▄ █▀    ',
    '     ▀█▀▀█▀█▄ ▄ ▄█▀▀▀█▀      ',
    '    ▀ ▀▀▀ ▀ ▄▀ ▄ ▄▀▄  ▀▄     ',
    '    █▀▀▀▀▀█ ▄  █▀█ ▀▀▀▄█▄    ',
    '    █ ███ █  █▀▀▀ ██▀▀ ▀▀    ',
    '    █ ▀▀▀ █ ██  ▄▀▀▀▀▄▀▀█    ',
    '    ▀▀▀▀▀▀▀ ▀    ▀▀▀▀ ▀▀▀    ',
    '                             ',
    '                             '].join('\n')

  t.plan(3)

  t.ok(!await writeViaCallback(fileName, segs, { errorCorrectionLevel: 'L' }),
    'There should be no errors if text is not string')
  t.ok(await exists(fileName),
    'Should save file with correct file name')
  t.equal(await read(fileName, 'utf8'), expectedOutput,
    'Should write correct content')
})
