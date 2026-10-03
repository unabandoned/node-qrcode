const test = require('tap').test
const sinon = require('sinon')
const fs = require('fs')
const QRCode = require('core/qrcode')
const Utf8Renderer = require('renderer/utf8')

test('Utf8Renderer interface', function (t) {
  t.type(Utf8Renderer.render, 'function',
    'Should have render function')

  t.end()
})

test('Utf8Renderer render', function (t) {
  const sampleQrData = QRCode.create('sample text', { version: 2 })
  let str

  t.doesNotThrow(function () { str = Utf8Renderer.render(sampleQrData) },
    'Should not throw with only qrData param')

  t.doesNotThrow(function () {
    str = Utf8Renderer.render(sampleQrData, {
      margin: 10,
      scale: 1
    })
  }, 'Should not throw with options param')

  t.type(str, 'string',
    'Should return a string')

  t.end()
})

test('Utf8 renderToFile', function (t) {
  const sampleQrData = QRCode.create('sample text', { version: 2 })
  const fileName = 'qrimage.txt'
  let fsStub = sinon.stub(fs, 'writeFile').callsArg(2)

  t.plan(5)

  Utf8Renderer.renderToFile(fileName, sampleQrData, function (err) {
    t.ok(!err,
      'Should not generate errors with only qrData param')

    t.equal(fsStub.getCall(0).args[0], fileName,
      'Should save file with correct file name')
  })

  Utf8Renderer.renderToFile(fileName, sampleQrData, {
    margin: 10,
    scale: 1
  }, function (err) {
    t.ok(!err,
      'Should not generate errors with options param')

    t.equal(fsStub.getCall(0).args[0], fileName,
      'Should save file with correct file name')
  })

  fsStub.restore()
  fsStub = sinon.stub(fs, 'writeFile').callsArgWith(2, new Error())

  Utf8Renderer.renderToFile(fileName, sampleQrData, function (err) {
    t.ok(err,
      'Should fail if error occurs during save')
  })

  fsStub.restore()
})

// THE INVERTED BLOCKS, which nothing exercised. A white foreground or a black
// background flips the block characters, and that branch was the only
// uncovered line in this file.
test('Utf8Renderer render with inverted colors', function (t) {
  const sampleQrData = QRCode.create('sample text', { version: 2 })

  const whiteOnDefault = Utf8Renderer.render(sampleQrData, { color: { dark: '#ffffff' } })
  const defaultOnBlack = Utf8Renderer.render(sampleQrData, { color: { light: '#000000' } })
  const normal = Utf8Renderer.render(sampleQrData)

  t.not(whiteOnDefault, normal, 'A white foreground should invert the blocks')
  t.not(defaultOnBlack, normal, 'A black background should invert the blocks')
  t.equal(whiteOnDefault, defaultOnBlack, 'Both inversions should render the same')

  t.end()
})
