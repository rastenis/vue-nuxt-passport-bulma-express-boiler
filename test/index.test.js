import { resolve } from 'path'
import { Nuxt, Builder } from 'nuxt'
import { JSDOM } from 'jsdom'
import test from 'ava'

// We keep the nuxt and server instance
// So we can close them at the end of the test
let nuxt = null

// Init Nuxt.js and create a server listening on localhost:4000
test.before(async () => {
  const config = {
    dev: false,
    rootDir: resolve(__dirname, '..')
  }
  nuxt = new Nuxt(config)
  await new Builder(nuxt).build()
  await nuxt.server.listen(4000, 'localhost')
}, 30000)

// Example of testing only generated html
test('Index route HTML contents', async (t) => {
  const context = {}
  const { html } = await nuxt.server.renderRoute('/', context)
  t.true(html.includes('Log in to see users'))
  t.true(html.includes('WELCOME'))

  // nuxt bundles images, so the way to test this is just via alts and class
  t.true(html.includes('alt="Nuxt.js Logo" class="logo"'))
})

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
test("Non-existent user API fetch", async t => {
  const { error } = await nuxt.renderRoute("/api/users/hello", {});
  t.true(
    error.statusCode === 404 && error.message === "This page could not be found"
  );
});

// Testing user route
test("Non-existent page fetch", async t => {
  const { html } = await nuxt.renderRoute(
    "/something/some-kind-of-request",
    {}
  );
  t.true(html.includes("This page could not be found"));
});

// Close server and ask nuxt to stop listening to file changes
test.after('Closing server and nuxt.js', (t) => {
  nuxt.close()
})
