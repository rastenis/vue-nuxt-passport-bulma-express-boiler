import { resolve } from "path";
import { Nuxt, Builder } from "nuxt";
import test from "ava";
import axios from "axios";
import config from "../config/config.json";

// We keep the nuxt and server instance
// So we can close them at the end of the test
let nuxt = null,
  cookie,
  email,
  ax = axios.create({ withCredentials: true });

// Init Nuxt.js and create a server listening on localhost:4000
test.before(async () => {
  const nuxtConfig = {
    dev: false,
    rootDir: resolve(__dirname, ".."),
    css: ["~/assets/css/main.css", "~/assets/css/bulma.min.css"],
    serverMiddleware: [
      // API middleware
      "~/src/server.js"
    ]
  };
  nuxt = new Nuxt(nuxtConfig);
  await new Builder(nuxt).build();
  await nuxt.server.listen(4000, "localhost");
}, 30000);

// Example of testing only generated html
test("Index route HTML contents", async t => {
  const context = {};
  const { html } = await nuxt.server.renderRoute("/", context);
  t.true(html.includes("Log in to see users"));
  t.true(html.includes("WELCOME"));

  // nuxt bundles images, so the way to test this is just via alts and class
  t.true(html.includes('alt="Nuxt.js Logo" class="logo"'));
});

// Testing register route
test("Register route & its contents", async t => {
  const { html } = await nuxt.renderRoute("/register", {});
  t.true(html.includes('<form action="/register" method="POST"'));
});

// Testing contents of publicly accessible routes
test("Login route & its contents", async t => {
  const { html } = await nuxt.renderRoute("/login", {});
  t.true(html.includes('<form action="/login" method="POST"'));
});

// Testing user route
test("Non-existent user fetch", async t => {
  const { html } = await nuxt.renderRoute("/some-kind-of-user", {});
  t.true(html.includes("User not found"));
});

// Testing non-user API fetch
test("Non-existent page fetch", async t => {
  const { error } = await nuxt.renderRoute("/some/false/route", {});
  t.true(
    error.statusCode === 404 && error.message === "This page could not be found"
  );
});

test("Auth-gated fetch attempt", async t => {
  try {
    const { data } = await ax.get(`http://localhost:${config.port}/api/users`);
  } catch (e) {
    t.is(e.response.status, 403);
    t.is(e.response.statusText, "Forbidden");
    t.deepEqual(e.response.data, { success: false, message: "Auth needed." });
  }
});

test("Registration", async t => {
  try {
    email = `tester${Math.random()
      .toString(36)
      .substr(2, 7)}@test.com`;
    const { data, headers } = await ax.post(
      `http://localhost:${config.port}/register`,
      {
        email: email,
        password: "password"
      },
      { withCredentials: true }
    );
    t.deepEqual(data.meta, {
      error: false,
      msg: "You have successfully registered!"
    });
    cookie = headers["set-cookie"][0];
  } catch (e) {
    console.log(e);
  }
});

test("Fetch users", async t => {
  try {
    const { data } = await ax({
      method: "get",
      url: `http://localhost:${config.port}/api/users`,
      withCredentials: true,
      headers: {
        Cookie: cookie
      }
    });

    t.deepEqual(data, [
      { name: "Alexandre" },
      { name: "Pooya" },
      { name: "Sébastien" }
    ]);
  } catch (e) {
    console.log(e);
  }
});

test("Fetch user", async t => {
  try {
    const { data } = await ax({
      method: "get",
      url: `http://localhost:${config.port}/api/users/0`,
      withCredentials: true,
      headers: {
        Cookie: cookie
      }
    });

    t.deepEqual(data, { name: "Alexandre" });
  } catch (e) {
    console.log(e);
  }
});

test("Logout", async t => {
  try {
    const { data } = await ax({
      method: "post",
      url: `http://localhost:${config.port}/logout`,
      withCredentials: true,
      headers: {
        Cookie: cookie
      }
    });

    t.deepEqual(data.meta, {
      error: false,
      msg: "You have successfully logged out!"
    });
  } catch (e) {
    console.log(e);
  }
});

test("Login again", async t => {
  try {
    const { data } = await ax({
      method: "post",
      url: `http://localhost:${config.port}/login`,
      withCredentials: true,
      headers: {
        Cookie: cookie
      },
      data: { email: email, password: "password" }
    });

    t.deepEqual(data.meta, {
      error: false
    });
  } catch (e) {
    console.log(e);
  }
});

test("Delete account", async t => {
  try {
    const { data } = await ax({
      method: "post",
      url: `http://localhost:${config.port}/deleteAccount`,
      withCredentials: true,
      headers: {
        Cookie: cookie
      }
    });

    t.deepEqual(data.meta, {
      error: false
    });
  } catch (e) {
    console.log(e);
  }
});

// Close server and ask nuxt to stop listening to file changes
test.after("Closing server and nuxt.js", t => {
  nuxt.close();
});
