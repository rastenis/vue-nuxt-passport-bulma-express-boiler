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
  /*
   ** Global CSS
   */
  css: ["~/assets/css/main.css", "~/assets/css/bulma.min.css"],
  /*
   ** Add axios globally
   */
  build: {
    vendor: ["axios"]
  }
};
