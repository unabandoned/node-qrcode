// The `qrcode` command, run as a user runs it: a child process per case.
//
// Each rendering case compares the command's output with what the library
// produces for the options the flags are meant to map to, so these pin the
// flag -> option mapping rather than any particular encoder output. The help,
// version and error texts are the ones yargs 15 printed, which the parseArgs
// rewrite keeps.
//
// node:test rather than tap, and outside tap's `test/**/*.test.js` glob: `npm
// test` runs it on its own with `node --test`.
const { test } = require('node:test')
const assert = require('node:assert')
const { spawnSync } = require('node:child_process')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const QRCode = require('../../lib')
const pkg = require('../../package.json')

const BIN = path.join(__dirname, '..', '..', 'bin', 'qrcode')

const HELP = [
  'Usage: qrcode [options] <input string>',
  '',
  'QR Code options:',
  '  -v, --qversion  QR Code symbol version (1 - 40)                       [number]',
  '  -e, --error     Error correction level           [choices: "L", "M", "Q", "H"]',
  '  -m, --mask      Mask pattern (0 - 7)                                  [number]',
  '',
  'Renderer options:',
  '  -t, --type        Output type                  [choices: "png", "svg", "utf8"]',
  '  -i, --inverse     Invert colors                                      [boolean]',
  '  -w, --width       Image width (px)                                    [number]',
  '  -s, --scale       Scale factor                                        [number]',
  '  -q, --qzone       Quiet zone size                                     [number]',
  '  -l, --lightcolor  Light RGBA hex color',
  '  -d, --darkcolor   Dark RGBA hex color',
  '  --small           Output smaller QR code to terminal                 [boolean]',
  '',
  'Options:',
  '  -o, --output  Output file',
  '  -h, --help    Show help                                              [boolean]',
  '  --version     Show version number                                    [boolean]',
  '',
  'Examples:',
  '  qrcode "some text"                    Draw in terminal window',
  '  qrcode -o out.png "some text"         Save as png image',
  '  qrcode -d F00 -o out.png "some text"  Use red as foreground color',
  ''
].join('\n')

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'qrcode-cli-'))
process.on('exit', () => fs.rmSync(tmp, { recursive: true, force: true }))

// stdin is empty and not a TTY unless `input` says otherwise, so the command
// falls back to its arguments for the text, as it does under a script.
function run (args, input) {
  const r = spawnSync(process.execPath, [BIN].concat(args), {
    cwd: tmp,
    input: input || '',
    encoding: 'utf8'
  })
  return { code: r.status, stdout: r.stdout, stderr: r.stderr }
}

function terminal (text, options) {
  return QRCode.toString(text, Object.assign({ type: 'terminal' }, options)).then((s) => s + '\n')
}

let n = 0
function outFile (ext) {
  return path.join(tmp, 'out' + (n++) + '.' + ext)
}

// What the library writes for these options: toFile renders through the file
// renderers, which differ from toString's (an XML prolog on SVG, for one).
async function libFile (ext, text, options) {
  const file = outFile(ext)
  await QRCode.toFile(file, text, options)
  return fs.readFileSync(file)
}

function failsWith (r, message) {
  assert.strictEqual(r.code, 1)
  assert.strictEqual(r.stdout, '')
  assert.strictEqual(r.stderr, HELP.replace(/\n$/, '') + '\n\n' + message + '\n')
}

test('--help and -h print the usage to stdout and exit 0', () => {
  for (const flag of ['--help', '-h']) {
    const r = run([flag])
    assert.strictEqual(r.code, 0)
    assert.strictEqual(r.stdout, HELP)
    assert.strictEqual(r.stderr, '')
  }
})

test('--version prints the package version', () => {
  const r = run(['--version'])
  assert.strictEqual(r.code, 0)
  assert.strictEqual(r.stdout, pkg.version + '\n')
})

test('help and version come before validation, and the first one given wins', () => {
  assert.strictEqual(run(['--help', '-e', 'X']).stdout, HELP)
  assert.strictEqual(run(['-t', 'png', '--version', 'hi']).stdout, pkg.version + '\n')
  assert.strictEqual(run(['--help', '--version']).stdout, HELP)
  assert.strictEqual(run(['--version', '--help']).stdout, pkg.version + '\n')
})

test('no input prints the usage to stderr and exits 1', () => {
  const r = run([])
  assert.strictEqual(r.code, 1)
  assert.strictEqual(r.stdout, '')
  assert.strictEqual(r.stderr, HELP)
})

test('draws to the terminal by default, joining the words', async () => {
  const r = run(['hello', 'world'])
  assert.strictEqual(r.code, 0)
  assert.strictEqual(r.stdout, await terminal('hello world', {}))
})

test('reads the text from stdin when there is any', async () => {
  const r = run([], 'from stdin')
  assert.strictEqual(r.code, 0)
  assert.strictEqual(r.stdout, await terminal('from stdin', {}))
})

test('-i/--inverse and --small change the terminal drawing', async () => {
  assert.strictEqual(run(['-i', 'hi']).stdout, await terminal('hi', { inverse: true }))
  assert.strictEqual(run(['--inverse', 'hi']).stdout, await terminal('hi', { inverse: true }))
  assert.strictEqual(run(['--small', 'hi']).stdout, await terminal('hi', { small: true }))
  assert.strictEqual(run(['--small', '-i', 'hi']).stdout, await terminal('hi', { small: true, inverse: true }))
  // A boolean takes a following true/false, and --no-* negates.
  assert.strictEqual(run(['-i', 'false', 'hi']).stdout, await terminal('hi', {}))
  assert.strictEqual(run(['--small=true', 'hi']).stdout, await terminal('hi', { small: true }))
  assert.strictEqual(run(['--inverse', '--no-inverse', 'hi']).stdout, await terminal('hi', {}))
})

test('-e/--error, -v/--qversion and -m/--mask reach the encoder', async () => {
  const expected = await terminal('hi', { errorCorrectionLevel: 'H', version: 5, maskPattern: 3 })
  assert.strictEqual(run(['-e', 'H', '-v', '5', '-m', '3', 'hi']).stdout, expected)
  assert.strictEqual(run(['--error', 'H', '--qversion', '5', '--mask', '3', 'hi']).stdout, expected)
  assert.strictEqual(run(['--error=H', '--qversion=5', '--mask=3', 'hi']).stdout, expected)
  assert.strictEqual(run(['-eH', '-v5', '-m3', 'hi']).stdout, expected)
})

test('numbers are coerced the way yargs coerced them', async () => {
  // '01' is 1, not a string, and 0x10 is hex.
  assert.strictEqual(run(['-v', '01', 'hi']).stdout, await terminal('hi', { version: 1 }))
  const file = outFile('svg')
  run(['-t', 'svg', '-o', file, '-w', '0x10', 'hi'])
  assert.deepStrictEqual(fs.readFileSync(file), await libFile('svg', 'hi', { type: 'svg', width: 16 }))
})

test('-o/--output saves a PNG by extension, and says so', async () => {
  const file = outFile('png')
  const r = run(['-o', file, 'hello'])
  assert.strictEqual(r.code, 0)
  assert.strictEqual(r.stdout, 'saved qrcode to: ' + file + '\n\n')
  assert.deepStrictEqual(fs.readFileSync(file), await libFile('png', 'hello', {}))

  const long = outFile('png')
  run(['--output', long, 'hello'])
  assert.deepStrictEqual(fs.readFileSync(long), fs.readFileSync(file))
})

test('-t/--type, -w/--width, -q/--qzone, -l/--lightcolor and -d/--darkcolor shape the file', async () => {
  const options = { type: 'svg', width: 300, margin: 1, color: { light: '0F0', dark: 'F00' } }
  const expected = await libFile('out', 'hello', options)

  const short = outFile('out')
  run(['-t', 'svg', '-o', short, '-w', '300', '-q', '1', '-l', '0F0', '-d', 'F00', 'hello'])
  assert.deepStrictEqual(fs.readFileSync(short), expected)

  const long = outFile('out')
  run(['--type', 'svg', '--output', long, '--width', '300', '--qzone', '1', '--lightcolor', '0F0', '--darkcolor', 'F00', 'hello'])
  assert.deepStrictEqual(fs.readFileSync(long), expected)
})

test('-s/--scale and -t utf8', async () => {
  const png = outFile('png')
  run(['-o', png, '-s', '2', 'hi'])
  assert.deepStrictEqual(fs.readFileSync(png), await libFile('png', 'hi', { scale: 2 }))

  const png2 = outFile('png')
  run(['-o', png2, '--scale', '2', 'hi'])
  assert.deepStrictEqual(fs.readFileSync(png2), fs.readFileSync(png))

  const txt = outFile('txt')
  run(['-t', 'utf8', '-o', txt, 'hi'])
  assert.deepStrictEqual(fs.readFileSync(txt), await libFile('txt', 'hi', { type: 'utf8' }))
})

test('-e and -t only take their listed choices', () => {
  failsWith(run(['-e', 'X', 'hi']), 'Invalid values:\n  Argument: e, Given: "X", Choices: "L", "M", "Q", "H"')
  failsWith(run(['-e', 'h', 'hi']), 'Invalid values:\n  Argument: e, Given: "h", Choices: "L", "M", "Q", "H"')
  failsWith(run(['-o', 'x', '-t', 'gif', 'hi']), 'Invalid values:\n  Argument: t, Given: "gif", Choices: "png", "svg", "utf8"')
  failsWith(run(['-e']), 'Invalid values:\n  Argument: e, Given: true, Choices: "L", "M", "Q", "H"')
})

test('-t needs -o', () => {
  failsWith(run(['-t', 'png', 'hi']), 'Missing dependent arguments:\n t -> output')
})

test('-w and -s, and --small and -t, are mutually exclusive', () => {
  failsWith(run(['-w', '10', '-s', '2', 'hi']), 'Arguments w and scale are mutually exclusive')
  failsWith(run(['-s', '2', '--width', '10', 'hi']), 'Arguments s and width are mutually exclusive')
  failsWith(run(['--small', '-t', 'svg', '-o', 'x.svg', 'hi']), 'Arguments small and type are mutually exclusive')
  // As with yargs, --no-small still counts as given.
  failsWith(run(['--no-small', '-t', 'svg', '-o', 'x.svg', 'hi']), 'Arguments small and type are mutually exclusive')
})

test('the checks run choices, then implies, then conflicts', () => {
  failsWith(run(['-t', 'png', '-e', 'X', 'hi']), 'Invalid values:\n  Argument: e, Given: "X", Choices: "L", "M", "Q", "H"')
  failsWith(run(['-t', 'png', '-w', '1', '-s', '2', 'hi']), 'Missing dependent arguments:\n t -> output')
})

test('an option followed by another option is left empty', async () => {
  const file = outFile('svg')
  const r = run(['-v', '-o', file, 'hi'])
  assert.strictEqual(r.code, 0)
  assert.deepStrictEqual(fs.readFileSync(file), await libFile('svg', 'hi', {}))
})

test('unknown options are ignored, along with the word after them', async () => {
  assert.strictEqual(run(['--unknown', 'swallowed', 'hi']).stdout, await terminal('hi', {}))
  assert.strictEqual(run(['--unknown=1', 'hi']).stdout, await terminal('hi', {}))
  assert.strictEqual(run(['-X', 'hi']).code, 1) // only word swallowed: no input
})

test('-- ends the options', async () => {
  assert.strictEqual(run(['--', '-o', 'x']).stdout, await terminal('-o x', {}))
})

test('a library error is reported and exits 1', () => {
  const r = run(['-v', '1', '-e', 'H', 'x'.repeat(100)])
  assert.strictEqual(r.code, 1)
  assert.match(r.stderr, /^Error: /)
})
