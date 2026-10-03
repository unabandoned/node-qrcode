// neostandard is the maintained successor to `standard`: the same rule set, on
// eslint 9 and @stylistic, from the maintainer of standard's own engine. `standard`
// itself is abandoned and pins eslint ^8, which went end-of-life in October 2024.
import neostandard from 'neostandard'

export default [
  ...neostandard(),
  {
    // Vendored third-party browser shims used by the example server, and the
    // generated browser bundle. Neither is ours to restyle.
    ignores: ['build/**', 'examples/vendors/**', '.tap/**']
  }
]
