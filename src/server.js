// deps
process.env.DEBUG = process.env.NODE_ENV === "production" ? "" : "nuxt:*";
const { Nuxt, Builder } = require("nuxt");
const bodyParser = require("body-parser");
const session = require("express-session");
const express = require("express");
const app = express();
const helmet = require("helmet");
const NedbStore = require("nedb-session-store")(session);
const favicon = require("serve-favicon");
const path = require("path");
const passport = require("passport");
const bcrypt = require("bcrypt");
const flash = require("flash");

const utils = require("./external/utilities.js");
const apiRoutes = require("./routes/users.js");

/*
Databases
*/
const db = require("./external/db.js");

/*
Importing the config
 */
const config = require("../config/config.json");

/*
Passport configuration.
 */
const passportConfig = require("../config/passportConfig.js");

/*
The user model
 */
const User = require("../src/controllers/user.js");

/*
Optional TLS cert generation (self_hosted must be 1 in the config)
 */
let lex;
if (config.self_hosted) {
  // returns an instance of node-greenlock with additional helper methods
  lex = require("greenlock-express").create({
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
      return cb(null, {
        options: opts,
        certs
      });
    }
  });
}
if (config.secure_override) {
  app.set("trust proxy", 1);
}

// statics
app.use("/i", express.static("assets/img"));
app.use(favicon(path.join(__dirname, "/../assets/favicon.ico")));
app.use(helmet());
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);
app.use(bodyParser.json());
app.use(
  session({
    name: "boilerSessionId", // non-default for security
    secret: config.session_secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: config.self_hosted || config.secure_override,
      // 4 hours cookie expiration when secure, infinite when unsecure.
      maxAge:
        (config.self_hosted || config.secure_override) &&
        !config.infinite_sessions // forcing infinite if infinite_sessions is set to true
          ? new Date(Date.now() + 60 * 60 * 1000 * 4)
          : null,
      domain: config.url.replace(/http:\/\/|https:\/\//g, "")
    },
    store: new NedbStore({
      filename: "db/persistence"
    })
  })
);
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

/*
API route import
*/
app.use("/api", apiRoutes);

/*
Login post route
*/
app.post("/login", (req, res) => {
  utils.log(`LOGIN | requester: ${req.body.email}`, 0);

  if (req.user) {
    return;
  }

  passport.authenticate("local", (err, user) => {
    if (err) {
      return res.json({
        meta: {
          error: true,
          msg: err.msg
        }
      });
    }
    if (!user) {
      // all failed logins default to the same error message
      return res.json({
        meta: {
          error: true,
          msg: "Bad credentials"
        }
      });
    }
    req.logIn(user, err => {
      if (err) {
        return res.json({
          meta: {
            error: true,
            msg: err
          }
        });
      }
      return res.json({
        meta: {
          error: false
        },
        user: user
      });
    });
  })(req, res);
});

/*
Register post route
*/
app.post("/register", (req, res, next) => {
  if (req.user) {
    return res.json({
      meta: {
        error: true,
        msg: "You're already logged in!"
      }
    });
  }

  // mirrored validation checks
  if (!/\S+@\S+\.\S+/.test(req.body.email)) {
    return res.json({
      meta: {
        error: true,
        msg: "Enter a valid email address."
      }
    });
  } else if (req.body.password.length < 5 || req.body.password.length > 100) {
    // arbitrary
    return res.json({
      meta: {
        error: true,
        msg: "Password must be between 5 and a 100 characters."
      }
    });
  }

  bcrypt
    .hash(req.body.password, config.bcrypt_salt_rounds)
    .then(hashed => {
      db.users.insert(
        {
          email: req.body.email.toLowerCase(),
          password: hashed
        },
        (err, newDoc) => {
          // error handling
          if (err) {
            if (err.errorType === "uniqueViolated") {
              return res.json({
                meta: {
                  error: true,
                  msg: "User with given email already exists!"
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

          newDoc = new User(newDoc);
          req.logIn(newDoc, err => {
            if (err) {
              utils.log(err, 1);
              return next(err);
            }
          });

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
    })
    .catch(err => {
      return res.json({
        meta: {
          error: true,
          msg: "Internal error. Please try again later!"
        }
      });
    });
});

// user logout route
app.post("/logout", (req, res) => {
  if (!req.user) {
    return;
  }

  req.logout();
  req.session.destroy(err => {
    if (err) {
      utils.log(
        "Error : Failed to destroy the session during logout." + err,
        1
      );
    }
    return res.json({
      meta: {
        error: false,
        msg: "You have successfully logged out!"
      }
    });
  });
});

// password change route
app.patch("/changePassword", (req, res) => {
  if (!req.user) {
    return;
  }

  let user = new User(req.user.data);

  user
    .verifyPassword(req.body.password)
    .then(r => {
      if (!r) {
        throw {
          error: true,
          msg: "The current password is wrong!"
        };
      }

      if (req.body.newPassword !== req.body.newPasswordRep) {
        throw {
          error: true,
          msg: "New passwords do not match!"
        };
      }

      user.data.password = req.body.newPassword;
      return user.password(req.body.newPassword);
    })
    .then(r => {
      return res.json({
        user: r,
        meta: {
          error: false,
          msg: "You have successfully changed your password!"
        }
      });
    })
    .catch(e => {
      return res.json({
        meta: e
      });
    });
});

// route to clear linked accounts
app.post("/unlink", (req, res) => {
  if (!req.user) {
    return;
  }

  let user = new User(req.user.data);

  user.data.tokens = user.data.tokens.filter(t => {
    return t.kind != req.body.toUnlink;
  });

  delete user.data[req.body.toUnlink];

  user.saveUser().then(r => {
    return res.json({
      user: user,
      meta: {
        error: false,
        msg: `You have successfully unlinked your ${req.body.toUnlink} account!`
      }
    });
  });
});

// route to delete account
app.post("/deleteAccount", (req, res) => {
  if (!req.user) {
    return;
  }

  let user = new User(req.user.data);

  user.deleteUser().then(r => {
    req.session.destroy(err => {
      if (err) {
        utils.log(
          "Error : Failed to destroy the session during logout." + err,
          1
        );
      }
      req.flash("info", "You have successfully deleted your account!");

      return res.json({
        meta: {
          error: false
        }
      });
    });
  });
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

const nuxtConfig = require("../nuxt.config.js");

nuxtConfig.dev = process.env.NODE_ENV !== "production";
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
if (config.self_hosted) {
  // handles acme-challenge and redirects to https
  require("http")
    .createServer(lex.middleware(require("redirect-https")()))
    .listen(80, function() {
      utils.log("Listening for ACME http-01 challenges on", this.address());
    });

  // https handler
  const server = require("https").createServer(
    lex.httpsOptions,
    lex.middleware(app)
  );
  server.listen(443, function() {
    utils.log(
      "Listening for ACME tls-sni-01 challenges and serve app on",
      this.address()
    );
  });
} else {
  app.listen(config.port);
  utils.log(`Server is listening on http://localhost:${config.port}`);
}
