// deps
process.env.DEBUG = process.env.NODE_ENV === "production" ? "" : "nuxt:*";
const { Nuxt, Builder } = require("nuxt");
const bodyParser = require("body-parser");
const session = require("express-session");
const app = require("express")();
const helmet = require("helmet");
const NedbStore = require("nedb-session-store")(session);
const favicon = require("serve-favicon");
const path = require("path");
const chalk = require("chalk");
const Datastore = require("nedb");
const bcrypt = require("bcrypt");
const utils = require("./external/utilities.js");

/*
A single database for user data
*/
const db = {
  users: new Datastore({ filename: "db/users", autoload: true })
};

/*
Importing the config
 */
const config = require("../config/config.json");

/*
Passport configuration.
 */
//const passportConfig = require("../config/passportConfig.js");

/*
Optional TLS cert generation (self_hosted must be 1 in the config)
 */
if (config.self_hosted === "1") {
  // returns an instance of node-greenlock with additional helper methods
  const lex = require("greenlock-express").create({
    server: "production",
    challenges: {
      "http-01": require("le-challenge-fs").create({
        webrootPath: "tmp/acme-challenges"
      })
    },
    store: require("le-store-certbot").create({
      webrootPath: "tmp/acme-challenges"
    }),
    approveDomains: function approveDomains(opts, certs, cb) {
      if (certs) {
        opts.domains = config.tls.domains;
      } else {
        opts.email = config.tls.email;
        opts.agreeTos = config.tls.agree_tos === "1";
      }
      cb(null, {
        options: opts,
        certs
      });
    }
  });
}

app.use(favicon(path.join(__dirname, "/../static/favicon.ico")));
app.use(helmet());
app.use(bodyParser.json());
app.use(
  session({
    secret: config.session_secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: config.self_hosted === "1",
      maxAge: config.infinite_sessions === "1" ? null : 24 * 60 * 60 * 1000 // 24 hours or infinite, depending on the config
    },
    store: new NedbStore({
      filename: "db/persistance"
    })
  })
);

/*
Login post route
*/
app.post("/api/login", (req, res) => {
  utils.log(`LOGIN | requester: " + ${req.body.username}`, 0);

  if (req.session.user) {
    return;
  }

  db.users.find(
    {
      username: req.body.username.toLowerCase()
    },
    (err, docs) => {
      try {
        // checks for duplicate usernames
        // performSecurityChecks(docs);
        // user exists, no duplicates. Proceeding to the password check
        if (bcrypt.compareSync(req.body.password, docs[0].password)) {
          utils.log(chalk.green("LOGIN | passwords match!"), 0);
          req.session.user = docs[0];
          return res.json(docs[0]);
        }
        utils.log(chalk.red("LOGIN | passwords don't match!"));
        return res.status(556).json({
          error: "Bad credentials"
        });
      } catch (e) {
        if (e.status) {
          res.status(e.status).json({
            error: e.message
          });
        } else {
          // stay silent
        }
      }
    }
  );
});

/*
Nuxt.js configuration
*/
// TODO: see if it builds correctly

const nuxtConfig = require("../nuxt.config.js");

nuxtConfig.dev = config.NODE_ENV !== "production";
const nuxt = new Nuxt(nuxtConfig);

if (nuxtConfig.dev) {
  const builder = new Builder(nuxt);
  builder.build();
}
// No build in production
app.use(nuxt.render);

/*
Port listening; HTTPS redirect setup if self_hosted is set in the config
*/
if (config.self_hosted === "1") {
  // handles acme-challenge and redirects to https
  require("http")
    .createServer(lex.middleware(require("redirect-https")()))
    .listen(80, function() {
      console.log("Listening for ACME http-01 challenges on", this.address());
    });

  // https handler
  const server = require("https").createServer(
    lex.httpsOptions,
    lex.middleware(app)
  );
  server.listen(443, function() {
    console.log(
      "Listening for ACME tls-sni-01 challenges and serve app on",
      this.address()
    );
  });
} else {
  app.listen(config.port);
  console.log(`Server is listening on http://localhost:${config.port}`);
}
