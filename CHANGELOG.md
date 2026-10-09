## [1.3.3](https://github.com/soldair/node-qrcode/compare/v1.3.2...v1.3.3) (2019-01-16)

fixing security vulnerabillities reported by users of snyk and `npm audit` major
versions of deps were bumped and should only impact development of qrcode.


## [1.6.2](https://github.com/unabandoned/node-qrcode/compare/qrcode-v1.6.1...qrcode-v1.6.2) (2026-10-09)


### Bug Fixes

* parse CLI arguments with node:util instead of yargs ([#33](https://github.com/unabandoned/node-qrcode/issues/33)) ([2d697fe](https://github.com/unabandoned/node-qrcode/commit/2d697fe2af21e9ae0ffed1682d4d19a2fb28b498))

## [1.6.1](https://github.com/unabandoned/node-qrcode/compare/qrcode-v1.6.0...qrcode-v1.6.1) (2026-10-03)


### Bug Fixes

* **deps:** update dependency pngjs to v7 ([#21](https://github.com/unabandoned/node-qrcode/issues/21)) ([91df10b](https://github.com/unabandoned/node-qrcode/commit/91df10bece8d18e519bb928a3cb0e98ff857c86a))
* drop browserify and colors, which nothing uses ([#26](https://github.com/unabandoned/node-qrcode/issues/26)) ([f0473b0](https://github.com/unabandoned/node-qrcode/commit/f0473b09e448fa954fd1c2bb55bb92c4667486c7))
* lint with eslint's own stack, dropping the abandoned standard ([#29](https://github.com/unabandoned/node-qrcode/issues/29)) ([396a82d](https://github.com/unabandoned/node-qrcode/commit/396a82dd1d960475ad6648d8f3b39eb8a7ecfce0))
* repair the browser build, which could not run at all ([#23](https://github.com/unabandoned/node-qrcode/issues/23)) ([f9969bd](https://github.com/unabandoned/node-qrcode/commit/f9969bd44a97a1c8d75e2834bc630cce9bd6d092))
* replace the abandoned standard with neostandard ([#27](https://github.com/unabandoned/node-qrcode/issues/27)) ([782d723](https://github.com/unabandoned/node-qrcode/commit/782d7234c2ce6e694925284e362baa63c0032ef6))
* stop the toFile tests racing each other over one file ([#30](https://github.com/unabandoned/node-qrcode/issues/30)) ([6026dc0](https://github.com/unabandoned/node-qrcode/commit/6026dc0f03173c50f38c513060b08838c9c2cecd))

## [1.6.0](https://github.com/unabandoned/node-qrcode/compare/qrcode-v1.5.4...qrcode-v1.6.0) (2026-10-03)


### Features

* adding changelog fixes [#165](https://github.com/unabandoned/node-qrcode/issues/165) ([b90c950](https://github.com/unabandoned/node-qrcode/commit/b90c95018cef69689b167d1b412ebe0c92c113b1))
* inverting colors on utf8 rendered codes ([f6ee352](https://github.com/unabandoned/node-qrcode/commit/f6ee352aaab22377c1e3475404651c736ca3e560))
* onboard as @unabandoned/qrcode, and fix what adopting it uncovered ([#1](https://github.com/unabandoned/node-qrcode/issues/1)) ([98f6ee4](https://github.com/unabandoned/node-qrcode/commit/98f6ee47abe0d13da91af74370e3e3780060fa44))


### Bug Fixes

* adding node 8 and 10 to travis ([004e26c](https://github.com/unabandoned/node-qrcode/commit/004e26cfb0ad2ec3c58dd307a61de50a923bad23))
* binary data not working as described (fixes [#289](https://github.com/unabandoned/node-qrcode/issues/289), [#231](https://github.com/unabandoned/node-qrcode/issues/231)) ([1eba16b](https://github.com/unabandoned/node-qrcode/commit/1eba16b58e91f588df565fdd9b7c1c8820f2ee9d))
* buffer class for browsers ([cc2a41f](https://github.com/unabandoned/node-qrcode/commit/cc2a41f8ccf081881789a3b2a699a96309eb9c5f))
* ficing double call for callbacks on error saving png to file ([9aeacd8](https://github.com/unabandoned/node-qrcode/commit/9aeacd8b5d8cdbb641c492d7dc7a85545ff5f5e8))
* fixed client side example ([9ed5412](https://github.com/unabandoned/node-qrcode/commit/9ed54121c65b591ba9307d6a81f24adc1b53ee05))
* fixes yargs coercing number args eating zeros ([e4ad095](https://github.com/unabandoned/node-qrcode/commit/e4ad0950833037784b48db75bb941d394d8eaa68))
* forgot can-promise replacement ([2514445](https://github.com/unabandoned/node-qrcode/commit/25144450d786c01aa4399988ffe3d691cf150cf9))
* impossible to set qrcode version due to conflicting cli -v flag ([8627abf](https://github.com/unabandoned/node-qrcode/commit/8627abfd06dd5543c1e55176d60530aa01c2ba98))
* making require for buffer module explicit fixes [#217](https://github.com/unabandoned/node-qrcode/issues/217) ([eb2d499](https://github.com/unabandoned/node-qrcode/commit/eb2d499ba7848765cc8d3b31397faf6251e7a36e))
* replacing can-promise ([8197d78](https://github.com/unabandoned/node-qrcode/commit/8197d780b8366e7fb45178331093fd8f8ba9b343))
* security vulnerabillities and a ref to new Buffer ([a40c757](https://github.com/unabandoned/node-qrcode/commit/a40c757205c10831d5187933d0979e785687d5c4))
* undefined variable Buffer in reed ([6058f49](https://github.com/unabandoned/node-qrcode/commit/6058f49c896f2951c1920a32b36e75a63be099cd))
* update docs for toString type option ([4d1225c](https://github.com/unabandoned/node-qrcode/commit/4d1225c9d6125e1af21a45c2b4bd0ea8bde9ddb3))
* wrong link for #gs1-qr-codes ([65fa203](https://github.com/unabandoned/node-qrcode/commit/65fa20380407db6246d12db3031fb1eac36b164e))


### Dependencies & maintenance

* remove note about webp support ([c6f369e](https://github.com/unabandoned/node-qrcode/commit/c6f369eb87d382e771d883e6ca5ddae50399d5fd))
* remove note about webp support ([b57f3f2](https://github.com/unabandoned/node-qrcode/commit/b57f3f2162e1567e0ad15d02747325700339308c))

## [1.3.2](https://github.com/soldair/node-qrcode/compare/v1.3.0...v1.3.2) (2019-01-16)


### Bug Fixes

* forgot can-promise replacement ([2514445](https://github.com/soldair/node-qrcode/commit/2514445))
* replacing can-promise ([8197d78](https://github.com/soldair/node-qrcode/commit/8197d78))
* security vulnerabillities and a ref to new Buffer ([a40c757](https://github.com/soldair/node-qrcode/commit/a40c757))



# [1.3.0](https://github.com/soldair/node-qrcode/compare/v1.2.1...v1.3.0) (2018-10-01)



## [1.2.1](https://github.com/soldair/node-qrcode/compare/v1.2.0...v1.2.1) (2018-06-06)



# [1.2.0](https://github.com/soldair/node-qrcode/compare/v1.1.0...v1.2.0) (2017-12-28)



# [1.1.0](https://github.com/soldair/node-qrcode/compare/v1.0.1...v1.1.0) (2017-12-28)



## [1.0.1](https://github.com/soldair/node-qrcode/compare/v1.0.0...v1.0.1) (2017-12-27)



# [1.0.0](https://github.com/soldair/node-qrcode/compare/v0.9.0...v1.0.0) (2017-11-08)

no breaking changes. promoting to a stable semver

# [0.9.0](https://github.com/soldair/node-qrcode/compare/v0.8.2...v0.9.0) (2017-07-22)



## [0.8.2](https://github.com/soldair/node-qrcode/compare/v0.8.0...v0.8.2) (2017-05-23)



# [0.8.0](https://github.com/soldair/node-qrcode/compare/v0.7.1...v0.8.0) (2017-03-30)



## [0.7.1](https://github.com/soldair/node-qrcode/compare/v0.7.0...v0.7.1) (2017-03-17)



# [0.7.0](https://github.com/soldair/node-qrcode/compare/v0.6.0...v0.7.0) (2017-02-27)



# [0.6.0](https://github.com/soldair/node-qrcode/compare/v0.5.0...v0.6.0) (2017-02-24)



# [0.5.0](https://github.com/soldair/node-qrcode/compare/v0.4.4...v0.5.0) (2016-09-19)



## [0.4.4](https://github.com/soldair/node-qrcode/compare/v0.4.3...v0.4.4) (2016-08-25)



## [0.4.3](https://github.com/soldair/node-qrcode/compare/v0.4.0...v0.4.3) (2016-08-16)



# [0.4.0](https://github.com/soldair/node-qrcode/compare/0.2.10...v0.4.0) (2015-09-17)



## [0.1.1](https://github.com/soldair/node-qrcode/compare/v0.1.0...v0.1.1) (2011-04-17)



# [0.1.0](https://github.com/soldair/node-qrcode/compare/0.0.3...v0.1.0) (2011-04-17)



## [0.0.3](https://github.com/soldair/node-qrcode/compare/0.0.2...0.0.3) (2011-02-27)



## 0.0.2 (2010-12-27)
