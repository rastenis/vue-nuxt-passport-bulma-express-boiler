# vue-nuxt-passport-bulma-express-boiler

> A vue/nuxtjs/passport/bulma boilerplate for express.

Demo website coming soon™.

## Setup

You'll have to set up api keys in `passportKeys.json`. This template contains Google and Twitter logins, but more can be added easily, as they're modular passportJS strategies.

* The process for obtaining a Google key is described [here](https://developers.google.com/identity/protocols/OAuth2).
* The process for obtaining a Twitter key is described [here](https://developer.twitter.com/en/docs/basics/authentication/guides/access-tokens.html).

```bash
# install dependencies
$ npm install

# serve with hot reload at localhost:3000
$ npm run dev

# build for production and launch server
$ npm build
$ npm start
```
### TODO list

1. ~~Animations & completed alerts for various auth actions~~
2. ~~Profile page, account linking(technically operational, but no UI for it yet)~~

#### Information & sources

For detailed explanation on how things work, checkout the [Nuxt.js docs](https://nuxtjs.org/guide).
Vue.js docs can be found here: [Vue.js docs](https://vuejs.org/v2/guide/index.html)

This project is based on:

1.  The nuxt-community [express-template](https://github.com/nuxt-community/express-template) for ease of comparison & demo api routes(this project contains the same routes locked behind an auth gate)
2.  The google/twitter passport.js strategy configurations were borrowed from sahat's [hackathon-starter](https://github.com/sahat/hackathon-starter).
