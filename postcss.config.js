const postcssCssNext = require('postcss-cssnext')
const postcssImport = require('postcss-import')

module.exports = {
  plugins: [
    postcssCssNext({
      features: {
        customProperties: {
          warnings: false
        }
      }
    }),
    postcssImport
  ]
}