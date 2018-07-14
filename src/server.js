// deps
process.env.DEBUG = process.env.NODE_ENV === "production" ? "" : "nuxt:*";
const {
  Nuxt,
  Builder
} = require("nuxt");
const bodyParser = require("body-parser");
const session = require("express-session");
const app = require("express")();
const helmet = require("helmet");
const NedbStore = require("nedb-session-store")(session);
const favicon = require("serve-favicon");
const path = require("path");
const chalk = require("chalk");
const Datastore = require("nedb");
const passport = require("passport");
const bcrypt = require("bcrypt");

const utils = require("./external/utilities.js");

const apiRoutes = require("./routes/users.js");

/*
A single database for user data
*/
const db = {
  users: new Datastore({
    filename: "db/users",
    autoload: true
  })
};

// making usernames unique
db.users.ensureIndex({
  fieldName: 'username',
  unique: true,
  sparse: true
}, function(err) {
  if (err) {
    console.error(err);
  }
});

/*
Importing the config
 */
const config = require("../config/config.json");

/*
Passport configuration.
 */
const passportConfig = require("../config/passportConfig.js");

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
app.use(bodyParser.urlencoded({
  extended: true
}));
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
      filename: "db/persistence"
    })
  })
);

/*
API route import
*/
app.use("/api", apiRoutes);

/*
Login post route
*/
app.post("/login", (req, res) => {
  utils.log(`LOGIN | requester: " + ${req.body.username}`, 0);

  if (req.session.user) {
    return;
  }

  db.users.find({
      username: req.body.username.toLowerCase()
    },
    (err, docs) => {
      if (err) {
        utils.log(err, 1);
        return res.json({
          meta: {
            error: false,
            msg: "Server error. Try again later."
          },
        });
      }

      if (docs === 1) {
        try {
          if (bcrypt.compareSync(req.body.password, docs[0].password)) {
            utils.log(chalk.green("LOGIN | passwords match!"), 0);
            req.session.user = docs[0];
            return res.json({
              meta: {
                error: false
              },
              user: docs[0]
            });
          }
          utils.log(chalk.red("LOGIN | passwords don't match!"));
        } catch (e) {
          if (e.status) {
            res.json({
              meta: {
                error: true,
                msg: e.message
              }
            });
            utils.log(e, 1);
          } else {
            // stay silent
          }
        }
      } else if (docs > 1) {
        // shouldn't be possible if DB indexing is setup correctly
        // prevent logins from either of the duplicate accounts until resolved
        utils.log(chalk.bgWhite.red("CRITICAL! Duplicate account usernames."), 1);
      }

      // all failed logins default to the same error message
      return res.json({
        meta: {
          error: true,
          msg: "Bad credentials"
        }
      });

    }
  );
});

/*
Register post route
*/
app.post("/register", (req, res) => {
  utils.log(`REGISTER | requester: " + ${req.body.username}`, 0);

  if (req.session.user) {
    return;
  }

  console.log(req.body);
  console.log("username: |" + req.body.username.toLowerCase() + "|");
  console.log("pw: |" + req.body.password + "|");

  db.users.insert({
      username: req.body.username.toLowerCase(),
      password: bcrypt.hashSync(req.body.password, config.bcrypt_salt_rounds)
    },
    (err, newDoc) => {

      // error handling
      if (err) {
        if (err.errorType === "uniqueViolated") {
          return res.json({
            meta: {
              error: true,
              msg: "User with given username already exists!"
            }
          });
        } else {
          utils.log(err, 1);
          return res.json({
            meta: {
              error: true,
              msg: "Server error. Try again later."
            }
          });
        }
      }

      console.log("match:" + bcrypt.compareSync(req.body.password, newDoc.password));

      // success!
      return res.json({
        meta: {
          error: false,
          msg: "You have successfully registered!"
        },
        user: newDoc
      });
    }
  );
});

/*
Sample Passportjs routes
*/
app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: "profile email"
  })
);
app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login"
  }),
  (req, res) => {
    res.redirect(req.session.returnTo || "/");
  }
);
app.get("/auth/twitter", passport.authenticate("twitter"));
app.get(
  "/auth/twitter/callback",
  passport.authenticate("twitter", {
    failureRedirect: "/login"
  }),
  (req, res) => {
    res.redirect(req.session.returnTo || "/");
  }
);

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