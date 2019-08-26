# vue-nuxt-passport-bulma-express-boiler

[![Status](https://travis-ci.org/scharkee/vue-nuxt-passport-bulma-express-boiler.svg?branch=master)](https://travis-ci.org/scharkee/vue-nuxt-passport-bulma-express-boiler)

A Vue+Vuex starter with Nuxt scaffolding, Bulma styling, and Express backend. [A demo website is available here.](https://vuenuxt.demos.matasr.com)


## Features

- Guided setup for config variables + API keys
- Flexible scaffolding, provided by NuxtJS
- Auth via email/password or via Google/Twitter.
- Auth merging, linking and unlinking of social auth accounts
- Client:
  - Vue + Bulma
  - Vuex state management example
  - Auth-gated data example
  - Based closely off of nuxt-community/express-template for ease of comparison
- The Backend is an Express server with Lightweight local storage provided with NeDB
- TLS/HTTPS:
  - Automatic certificate generation powered by greenlock
  - Self hosted mode (443/80 port access required) + simple mode (http only, custom port), for local use

## Setup

```bash
# install dependencies
$ npm install

# run setup
$ npm run setup

# serve with hot reload at localhost:3000
$ npm run dev

# build for production and launch server
$ npm build
$ npm start
```

Follow the config to set up both the `config.json` and `passportKeys.json` automatically. There are example files if you want to set up manually.

This template contains Google and Twitter logins, but more can be added easily, as they're modular passportJS strategies.

- The process for obtaining a Google key is described [here](https://developers.google.com/identity/protocols/OAuth2).
- The process for obtaining a Twitter key is described [here](https://developer.twitter.com/en/docs/basics/authentication/guides/access-tokens.html).

### Running locally

If you set secure_override to true in the `config.json`, Express will be set up with `trust proxy`, which will allow for secure cookies to work over reverse proxies (Apache, Nginx, etc.)

### TODO list

1. ~~Animations & completed alerts for various auth actions~~
2. ~~Profile page, account linking(technically operational, but no UI for it yet)~~
3. ~~Guided setup~~

#### Information & sources

For detailed explanation on how things work, checkout the [Nuxt.js docs](https://nuxtjs.org/guide).
Vue.js docs can be found here: [Vue.js docs](https://vuejs.org/v2/guide/index.html)

This project is based on:

1. The nuxt-community [express-template](https://github.com/nuxt-community/express-template) for ease of comparison & demo api routes(this project contains the same routes locked behind an auth gate)
2. The google/twitter passport.js strategy configurations were borrowed from sahat's [hackathon-starter](https://github.com/sahat/hackathon-starter).
