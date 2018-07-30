import { resolve } from "path";
import { Nuxt, Builder } from "nuxt-edge";
import { JSDOM } from "jsdom";
import test from "ava";

// We keep the nuxt and server instance
// So we can close them at the end of the test
let nuxt = null;

// Init Nuxt.js and create a server listening on localhost:4000
test.before(async () => {
  const nuxtConfig = require("../nuxt.config.js");

  nuxt = new Nuxt(nuxtConfig);
  await new Builder(nuxt).build();
  await nuxt.listen(3000, "localhost");
}, 30000);

// Testing contents of publicly accessible routes
test("Index route & its contents", async testing => {
  const context = {};
  const { index } = await nuxt.renderRoute("/", context);
  console.log(context);
  console.log(index);
  testing.true(index.includes('<h1 class="title">WELCOME</h1>'));
});

// ending the test
test.after("Exitting...", t => {
  nuxt.close();
});
