import { babel } from '@rollup/plugin-babel'
import { terser } from 'rollup-plugin-terser'
import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'

// @rollup/plugin-commonjs defaults to strictRequires: 'auto' from v25, which
// wraps a CommonJS module whose requires it cannot prove are unconditional. A
// wrapped module's exports cannot be read statically, so `exports.create`,
// `exports.toDataURL` and friends vanished from the bundle and only a synthetic
// `default` remained — a script-tag consumer would have had QRCode.toDataURL
// undefined. Everything here requires at the top level, so no wrapping is
// needed, and this is the behaviour that produced the bundle 1.6.0 shipped.
const commonjsConfig = { strictRequires: false }

const babelConfig = {
  babelrc: false,
  // @rollup/plugin-babel requires this to be stated rather than defaulted.
  // 'bundled' is what rollup-plugin-babel@4 did implicitly: helpers are inlined
  // into the bundle, which is what an IIFE with no runtime dependency needs.
  babelHelpers: 'bundled',
  presets: [['@babel/preset-env', { targets: 'defaults, IE >= 10, Safari >= 5.1' }]]
}

export default [{
  input: 'lib/browser.js',
  output: { file: 'build/qrcode.js', format: 'iife', name: 'QRCode', exports: 'named' },
  plugins: [commonjs(commonjsConfig), resolve(), babel(babelConfig), terser()]
}, {
  input: 'helper/to-sjis-browser.js',
  // 'auto', not 'none': @rollup/plugin-commonjs now turns a CommonJS entry into
  // a module with a synthetic default export, and rollup refuses 'none' when the
  // entry exports anything. The bundle still only runs for its side effect of
  // assigning QRCode.toSJIS; the exported value has no name to land on.
  output: { file: 'build/qrcode.tosjis.js', format: 'iife', exports: 'auto' },
  plugins: [commonjs(commonjsConfig), resolve(), babel(babelConfig), terser()]
}]
