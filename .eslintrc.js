module.exports = {
  env: {
    browser: true,
    commonjs: true,
    node: true
  },
  plugins: ["prettier"],
  extends: ["eslint:recommended", "prettier","plugin:vue/essential"],
  parserOptions: {
    ecmaVersion: 6
  },
  rules: {
    indent: ["error", 2],
    "linebreak-style": ["error", "unix"],
    quotes: ["error", "double"],
    semi: ["error", "always"],
    "prettier/prettier": ["error", { singleQuote: false }],
    avoidEscape: true
  }
};
