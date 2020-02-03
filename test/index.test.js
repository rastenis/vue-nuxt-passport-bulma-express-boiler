const { resolve } = require("path");
const { Nuxt, Builder } = require("nuxt");
const axios = require("axios");
const config = require("../config/config.json");

// We keep the nuxt and server instance
// So we can close them at the end of the test
let nuxt = null,
  cookie,
  email,
  ax = axios.create({ withCredentials: true });

beforeAll(async () => {
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
});

// Example of testing only generated html
test("Index route HTML contents", async () => {
  const context = {};
  const { html } = await nuxt.server.renderRoute("/", context);
  expect(html.includes("Log in to see users")).toBe(true);
  expect(html.includes("WELCOME")).toBe(true);

  // nuxt bundles images, so the way to test this is just via alts and class
  expect(html.includes('alt="Nuxt.js Logo" class="logo"')).toBe(true);
});

// Testing register route
test("Register route & its contents", async () => {
  const { html } = await nuxt.renderRoute("/register", {});
  expect(html.includes('<form action="/register" method="POST"')).toBe(true);
});

// Testing contents of publicly accessible routes
test("Login route & its contents", async () => {
  const { html } = await nuxt.renderRoute("/login", {});
  expect(html.includes('<form action="/login" method="POST"')).toBe(true);
});

// Testing user route
test("Non-existent user fetch", async () => {
  const { html } = await nuxt.renderRoute("/some-kind-of-user", {});
  expect(html.includes("User not found")).toBe(true);
});

// Testing non-user API fetch
test("Non-existent page fetch", async () => {
  const { error } = await nuxt.renderRoute("/some/false/route", {});
  expect(
    error.statusCode === 404 && error.message === "This page could not be found"
  ).toBe(true);
});

test("Auth-gated fetch attempt", async () => {
  try {
    const { data } = await ax.get(`http://localhost:${config.port}/api/users`);
  } catch (e) {
    expect(e.response.status).toBe(403);
    expect(e.response.statusText).toBe(403);
    expect(e.response.data).toEqual({
      success: false,
      message: "Auth needed."
    });
  }
});

test("Registration", async () => {
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
    expect(data.meta).toEqual({
      error: false,
      msg: "You have successfully registered!"
    });
    cookie = headers["set-cookie"][0];
  } catch (e) {
    console.log(e);
  }
});

test("Fetch users", async () => {
  try {
    const { data } = await ax({
      method: "get",
      url: `http://localhost:${config.port}/api/users`,
      withCredentials: true,
      headers: {
        Cookie: cookie
      }
    });

    expect(data).toEqual([
      { name: "Alexandre" },
      { name: "Pooya" },
      { name: "Sébastien" }
    ]);
  } catch (e) {
    console.log(e);
  }
});

test("Fetch user", async () => {
  try {
    const { data } = await ax({
      method: "get",
      url: `http://localhost:${config.port}/api/users/0`,
      withCredentials: true,
      headers: {
        Cookie: cookie
      }
    });

    expect(data).toEqual({ name: "Alexandre" });
  } catch (e) {
    console.log(e);
  }
});

test("Logout", async () => {
  try {
    const { data } = await ax({
      method: "post",
      url: `http://localhost:${config.port}/logout`,
      withCredentials: true,
      headers: {
        Cookie: cookie
      }
    });

    expect(data.meta).toEqual({
      error: false,
      msg: "You have successfully logged out!"
    });
  } catch (e) {
    console.log(e);
  }
});

test("Login again", async () => {
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

    expect(data.meta).toEqual({
      error: false
    });
  } catch (e) {
    console.log(e);
  }
});

test("Delete account", async () => {
  try {
    const { data } = await ax({
      method: "post",
      url: `http://localhost:${config.port}/deleteAccount`,
      withCredentials: true,
      headers: {
        Cookie: cookie
      }
    });

    expect(data.meta).toEqual({
      error: false
    });
  } catch (e) {
    console.log(e);
  }
});

// Close server and ask nuxt to stop listening to file changes
afterAll(() => {
  nuxt.close();
});
