const spawn = require('child_process').spawn
const path = require('path')

const opt = {
  cwd: __dirname,
  env: (function () {
    process.env.NODE_PATH = './' + path.delimiter + './lib'
    return process.env
  }()),
  stdio: [process.stdin, process.stdout, process.stderr]
}

// EXIT WITH TAP'S CODE, because this process is what `npm test` reports on.
//
// The spawn's result was dropped, so this wrapper always exited 0: tap could
// fail every assertion in the suite and `npm test` still succeeded. That is a
// green CI run that proves nothing, and it is the worst kind of test failure
// because it is silent. Caught while adopting this package — four assertions
// were failing and the suite was reporting success.
//
// No coverage flags: tap enforces full coverage by default from 18 onwards, so
// `--cov --100` became an unknown-option error rather than a no-op. Opting out
// would now take `--allow-incomplete-coverage`, which is the point.
const child = spawn('node', [
  'node_modules/.bin/tap',
  process.argv[2] || 'test/**/*.test.js'
], opt)

child.on('exit', function (code, signal) {
  // A signal is a failure too, and has no exit code of its own to pass on.
  process.exit(signal ? 1 : code)
})
