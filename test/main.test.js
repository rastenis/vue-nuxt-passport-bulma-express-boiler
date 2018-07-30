import { resolve } from "path";
import { Nuxt, Builder } from "nuxt-edge";
import { JSDOM } from "jsdom";
import test from "ava";
var rpn = require("request-promise-native");

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

// Testing register route
test("Register route & its contents", async testing => {
  const context = {};
  const { html } = await nuxt.renderRoute("/register", context);
  testing.true(html.includes('<form action="/register" method="POST"'));
});

// Testing contents of publicly accessible routes
test("Login route & its contents", async testing => {
  const context = {};
  const { html } = await nuxt.renderRoute("/login", context);
  testing.true(html.includes('<form action="/login" method="POST"'));
});

// Testing user route
test("Non-existent user fetch", async testing => {
  const context = {};
  const { html } = await nuxt.renderRoute("/some-kind-of-user", context);
  testing.true(html.includes("User not found"));
});

// Testing non-user API fetch
test("Non-existent user API fetch", async testing => {
  const context = {};
  const { error } = await nuxt.renderRoute("/api/users/hello", context);
  testing.true(
    error.statusCode === 404 && error.message === "This page could not be found"
  );
});

// // Testing user API fetch
// test("User API fetch", async testing => {
//   const context = {};
//   const html = await rpn("http://localhost:3000/api/users/1", context);
//   console.log(html);
//   testing.true(html.includes('{"name":"Pooya"}'));
// });

// Testing user route
test("Non-existent page fetch", async testing => {
  const context = {};
  const { html } = await nuxt.renderRoute(
    "/something/some-kind-of-request",
    context
  );
  testing.true(html.includes("This page could not be found"));
});

// // Testing index route
// test("Index route & its contents", async testing => {
//   const context = {};
//   const { html } = await nuxt.renderRoute("/", context);
//   console.log(html);
//   testing.true(
//     html.includes(
//       '<img src="~assets/img/logo.png" alt="Nuxt.js Logo" class="logo"'
//     )
//   );
// });

// ending the test
test.after("Exitting...", t => {
  nuxt.close();
});
