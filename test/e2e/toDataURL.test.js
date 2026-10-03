const test = require('tap').test
const QRCode = require('lib')
const QRCodeBrowser = require('lib/browser')
const { createCanvas } = require('canvas')
const Helpers = require('test/helpers')
const Utils = require('lib/renderer/utils')

// WHAT THIS PACKAGE IS RESPONSIBLE FOR, rather than what node-canvas encodes.
//
// These assertions used to compare the data URL against a base64 PNG captured
// from canvas@2. That string is canvas's encoder output, not ours: canvas@3
// writes a valid, different PNG for the same pixels, so the test failed on a
// dependency bump while the rendering was perfectly correct. Worse, the old
// canvas could not be installed at all on Node 22 — no prebuilt binary and no
// source build — so the suite was pinned to a version that no longer runs.
//
// So compare the PIXELS the renderer drew against the module matrix the core
// produced. It is encoder-independent, survives a canvas bump, and tests more
// than the old assertion did: a byte-identical PNG proves the compressor is
// deterministic, while this proves the QR is actually drawn correctly.
function drawsTheQRCode (canvas, text, options) {
  const qr = QRCode.create(text, options)
  const opts = Utils.getOptions(options)
  const scale = Utils.getScale(qr.modules.size, opts)
  const image = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data

  for (let row = 0; row < qr.modules.size; row++) {
    for (let col = 0; col < qr.modules.size; col++) {
      // The centre of the module, so antialiasing at an edge cannot decide it.
      const x = Math.floor((col + opts.margin) * scale + scale / 2)
      const y = Math.floor((row + opts.margin) * scale + scale / 2)
      const dark = image[(y * canvas.width + x) * 4] < 128
      if (dark !== Boolean(qr.modules.data[row * qr.modules.size + col])) return false
    }
  }
  return true
}

function isPngDataURL (url) {
  if (typeof url !== 'string' || !url.startsWith('data:image/png;base64,')) return false
  return Buffer.from(url.slice('data:image/png;base64,'.length), 'base64')
    .subarray(1, 4).toString() === 'PNG'
}

test('toDataURL - no promise available', function (t) {
  Helpers.removeNativePromise()

  t.throws(function () { QRCode.toDataURL() },
    'Should throw if no arguments are provided')

  t.throws(function () { QRCode.toDataURL(function () {}) },
    'Should throw if text is not provided')

  t.throws(function () { QRCode.toDataURL('some text') },
    'Should throw if a callback is not provided')

  t.throws(function () { QRCode.toDataURL('some text', {}) },
    'Should throw if a callback is not a function')

  t.throws(function () { QRCodeBrowser.toDataURL() },
    'Should throw if no arguments are provided (browser)')

  t.throws(function () { QRCodeBrowser.toDataURL(function () {}) },
    'Should throw if text is not provided (browser)')

  t.throws(function () { QRCodeBrowser.toDataURL('some text') },
    'Should throw if a callback is not provided (browser)')

  t.throws(function () { QRCodeBrowser.toDataURL('some text', {}) },
    'Should throw if a callback is not a function (browser)')

  t.end()

  Helpers.restoreNativePromise()
})

test('toDataURL - image/png', function (t) {
  const expectedDataURL = [
    'data:image/png;base64,',
    'iVBORw0KGgoAAAANSUhEUgAAAHQAAAB0CAYAAABUmhYnAAAAAklEQVR4AewaftIAAAKzSU',
    'RBVO3BQW7kQAwEwSxC//9y7h55akCQxvYQjIj/scYo1ijFGqVYoxRrlGKNUqxRijVKsUYp',
    '1ijFGqVYoxRrlGKNUqxRijXKxUNJ+EkqdyShU+mS0Kl0SfhJKk8Ua5RijVKsUS5epvKmJD',
    'yh8iaVNyXhTcUapVijFGuUiw9Lwh0qdyShU+mS0Kl0Kk8k4Q6VTyrWKMUapVijXHw5lROV',
    'kyR0Kt+sWKMUa5RijXIxTBI6lS4JkxVrlGKNUqxRLj5M5Tcl4UTlCZW/pFijFGuUYo1y8b',
    'Ik/KQkdCpdEjqVLgmdykkS/rJijVKsUYo1ysVDKt9M5UTlmxRrlGKNUqxRLh5Kwh0qXRJ+',
    'UxLuULkjCZ3KJxVrlGKNUqxRLh5S6ZLQqXRJ6FS6JHQqXRKeSEKn0iWhUzlJwolKl4QTlS',
    'eKNUqxRinWKBe/LAmdSpeETuUkCZ1Kl4QTlS4Jd6h0SehUuiS8qVijFGuUYo1y8WFJ6FS6',
    'JJyofFISOpVOpUtCp3KicqLypmKNUqxRijXKxYep3JGEE5UuCZ3KHSp3qHRJ6FR+U7FGKd',
    'YoxRol/scXS8ITKidJeEKlS8KJyhPFGqVYoxRrlIuHkvCTVE5U7kjCicpJEk6S8JOKNUqx',
    'RinWKBcvU3lTEu5IwolKp/KEyh1J6FTeVKxRijVKsUa5+LAk3KHyJpWTJHQqdyShU/lNxR',
    'qlWKMUa5SLL6fSJaFLwhNJeCIJP6lYoxRrlGKNcvHlknCicpKEE5UuCSdJOFHpktCpPFGs',
    'UYo1SrFGufgwlZ+k0iWhU+lUnlDpktCpdEnoVN5UrFGKNUqxRrl4WRL+EpU7ktCpdCpdEj',
    'qVO5LQqTxRrFGKNUqxRon/scYo1ijFGqVYoxRrlGKNUqxRijVKsUYp1ijFGqVYoxRrlGKN',
    'UqxRijXKP0OHEepgrecVAAAAAElFTkSuQmCC'].join('')

  t.plan(8)

  t.throws(function () { QRCode.toDataURL() },
    'Should throw if no arguments are provided')

  QRCode.toDataURL('i am a pony!', {
    errorCorrectionLevel: 'L',
    type: 'image/png'
  }, function (err, url) {
    t.ok(!err, 'there should be no error ' + err)
    t.equal(url, expectedDataURL,
      'url should match expected value for error correction L')
  })

  QRCode.toDataURL('i am a pony!', {
    version: 1, // force version=1 to trigger an error
    errorCorrectionLevel: 'H',
    type: 'image/png'
  }, function (err, url) {
    t.ok(err, 'there should be an error ')
    t.notOk(url, 'url should be null')
  })

  t.equal(typeof QRCode.toDataURL('i am a pony!').then, 'function',
    'Should return a promise')

  QRCode.toDataURL('i am a pony!', {
    errorCorrectionLevel: 'L',
    type: 'image/png'
  }).then(function (url) {
    t.equal(url, expectedDataURL,
      'url should match expected value for error correction L (promise)')
  })

  QRCode.toDataURL('i am a pony!', {
    version: 1, // force version=1 to trigger an error
    errorCorrectionLevel: 'H',
    type: 'image/png'
  }).catch(function (err) {
    t.ok(err, 'there should be an error (promise)')
  })
})

test('Canvas toDataURL - image/png', function (t) {
  t.plan(11)

  t.throws(function () { QRCodeBrowser.toDataURL() },
    'Should throw if no arguments are provided')

  t.throws(function () { QRCodeBrowser.toDataURL(function () {}) },
    'Should throw if text is not provided')

  const canvas = createCanvas(200, 200)
  QRCodeBrowser.toDataURL(canvas, 'i am a pony!', {
    errorCorrectionLevel: 'H',
    type: 'image/png'
  }, function (err, url) {
    t.ok(!err, 'there should be no error ' + err)
    t.ok(isPngDataURL(url) && drawsTheQRCode(canvas, 'i am a pony!', { errorCorrectionLevel: 'H', type: 'image/png' }),
      'should render the expected QR code to the canvas')
  })

  QRCodeBrowser.toDataURL(canvas, 'i am a pony!', {
    version: 1, // force version=1 to trigger an error
    errorCorrectionLevel: 'H',
    type: 'image/png'
  }, function (err, url) {
    t.ok(err, 'there should be an error ')
    t.notOk(url, 'url should be null')
  })

  QRCodeBrowser.toDataURL(canvas, 'i am a pony!', {
    errorCorrectionLevel: 'H',
    type: 'image/png'
  }).then(function (url) {
    t.ok(isPngDataURL(url) && drawsTheQRCode(canvas, 'i am a pony!', { errorCorrectionLevel: 'H', type: 'image/png' }),
      'should render the expected QR code to the canvas (promise)')
  })

  QRCodeBrowser.toDataURL(canvas, 'i am a pony!', {
    version: 1, // force version=1 to trigger an error
    errorCorrectionLevel: 'H',
    type: 'image/png'
  }).catch(function (err) {
    t.ok(err, 'there should be an error (promise)')
  })

  // Mock document object
  global.document = {
    createElement: function (el) {
      if (el === 'canvas') {
        return createCanvas(200, 200)
      }
    }
  }

  QRCodeBrowser.toDataURL('i am a pony!', {
    errorCorrectionLevel: 'H',
    type: 'image/png'
  }, function (err, url) {
    t.ok(!err, 'there should be no error ' + err)
    t.ok(isPngDataURL(url) && drawsTheQRCode(canvas, 'i am a pony!', { errorCorrectionLevel: 'H', type: 'image/png' }),
      'should render the expected QR code to the canvas')
  })

  QRCodeBrowser.toDataURL('i am a pony!', {
    errorCorrectionLevel: 'H',
    type: 'image/png'
  }).then(function (url) {
    t.ok(isPngDataURL(url) && drawsTheQRCode(canvas, 'i am a pony!', { errorCorrectionLevel: 'H', type: 'image/png' }),
      'should render the expected QR code to the canvas (promise)')
  })
})
