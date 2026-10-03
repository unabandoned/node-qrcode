const test = require('tap').test
const QRCode = require('lib')

// THE PUBLIC API WITH NO TEST. QRCode.toBuffer is documented and exported, and
// nothing in this suite called it — which is why lib/server.js could not reach
// the --100 coverage gate the suite sets for itself.
test('toBuffer', function (t) {
  t.plan(7)

  t.throw(function () { QRCode.toBuffer() },
    'Should throw if no arguments are provided')

  QRCode.toBuffer('i am a pony!', function (err, buffer) {
    t.ok(!err, 'there should be no error ' + err)
    t.ok(Buffer.isBuffer(buffer), 'Should return a buffer')
    t.equal(buffer.subarray(1, 4).toString(), 'PNG', 'Should return PNG data')
  })

  QRCode.toBuffer('i am a pony!', { errorCorrectionLevel: 'H' })
    .then(function (buffer) {
      t.ok(Buffer.isBuffer(buffer), 'Should return a buffer (promise)')
      t.equal(buffer.subarray(1, 4).toString(), 'PNG', 'Should return PNG data (promise)')
    })

  QRCode.toBuffer('i am a pony!', { version: 1, errorCorrectionLevel: 'H' })
    .catch(function (err) {
      t.ok(err, 'there should be an error for an impossible version (promise)')
    })
})
