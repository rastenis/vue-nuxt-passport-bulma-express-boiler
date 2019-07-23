module.exports = {
  head: {
    title: "boiler",
    meta: [
      {
        charset: "utf-8"
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1"
      },
      {
        hid: "description",
        name: "description",
        content: "Nuxt.js project"
      }
    ],
    link: [
      {
        rel: "icon",
        type: "image/x-icon",
        href: "/favicon.ico"
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css?family=Montserrat"
      }
    ]
  },
  build: {
    postcss: {
      "postcss-cssnext": {},
      "postcss-import": {}
    }
  },
  /*
   ** Global CSS
   */
  css: ["~/assets/css/main.css", "~/assets/css/bulma.min.css"],
  serverMiddleware: [
    // API middleware
    "~/src/server.js"
  ]
};
