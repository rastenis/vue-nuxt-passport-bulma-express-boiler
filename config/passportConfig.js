require("dotenv").config();
const passport = require("passport");
const { Strategy: LocalStrategy } = require("passport-local");
const { Strategy: TwitterStrategy } = require("passport-twitter");
const { OAuth2Strategy: GoogleStrategy } = require("passport-google-oauth");

const db = require("../src/external/db.js");
const keysConf = require("../config/passportKeys.json");
const User = require("../src/controllers/user.js");
const config = require("./config.json");

passport.serializeUser((user, done) => done(null, user.data._id));

passport.deserializeUser((id, done) => {
  db.users.findOne(
    {
      _id: id
    },
    (err, user) => {
      if (err) {
        console.error(err);
      }
      user = new User(user);
      return done(err, user);
    }
  );
});

/*
 * Sign in using Email and Password.
 */
passport.use(
  new LocalStrategy(
    {
      usernameField: "email"
    },
    (email, password, done) => {
      db.users.findOne(
        {
          email: email.toLowerCase()
        },
        (err, user) => {
          if (err) {
            return done(err);
          }
          if (!user) {
            return done(
              {
                msg: `Email ${email} not found.`
              },
              false
            );
          }

          user = new User(user);
          user.comparePassword(password, (err, isMatch) => {
            if (err) {
              return done(err);
            }
            if (isMatch) {
              return done(null, user);
            }
            return done(
              {
                msg: "Invalid email or password."
              },
              false
            );
          });
        }
      );
    }
  )
);

/*
 * OAuth Strategy:
 *
 * IF User is already logged in:
 *   - Check if there is an existing account with a provider id.
 *     - If there is, return an error message. (Can't link already linked accounts)
 *     - Else link new OAuth account with currently logged-in user.
 * IF User is not logged in:
 *   - Check if it's a returning user.
 *     - If returning user, sign in and we are done.
 *     - Else check if there is an existing account with user"s email.
 *       - If there is, return an error message.
 *       - Else create a new account.
 */

/*
 * Sign in with Twitter.
 */
passport.use(
  new TwitterStrategy(
    {
      consumerKey: keysConf.TWITTER_KEY,
      consumerSecret: keysConf.TWITTER_SECRET,
      callbackURL: `${config.url || ""}/auth/twitter/callback`,
      passReqToCallback: true
    },
    (req, accessToken, tokenSecret, profile, done) => {
      db.users.findOne(
        {
          twitter: profile.id
        },
        (err, existingUser) => {
          if (err) {
            return done(err);
          }
          if (existingUser) {
            if (req.user) {
              req.flash("error", "This Twitter account is already linked.");
              return done(err);
            }
            return done(null, new User(existingUser));
          }

          if (req.user) {
            // linking twitter with existing logged in account
            let user = new User(req.user.data);
            user.data.twitter = profile.id;
            user.data.tokens.push({
              kind: "twitter",
              accessToken,
              tokenSecret
            });
            user.data.profile.name =
              user.data.profile.name || profile.displayName;
            user.data.profile.location =
              user.data.profile.location || profile._json.location;
            user.data.profile.picture =
              user.data.profile.picture ||
              profile._json.profile_image_url_https;

            user
              .saveUser()
              .then(r => {
                req.logIn(r, err => {
                  if (err) {
                    console.error(err);
                    return next(err);
                  }
                });
                req.flash("info", "Twitter linked successfully!");
                return done(err, user);
              })
              .catch(e => done(e));
            // exit out
            return;
          }

          // create new user
          const user = new User();
          // Twitter will not provide an email address.  Period.
          // But a person’s twitter username is guaranteed to be unique
          // so we can "fake" a twitter email address as follows:
          user.data.email = `${profile.username}@twitter.com`;
          user._meta.noPassword = true;
          user.data.twitter = profile.id;
          user.data.tokens.push({
            kind: "twitter",
            accessToken,
            tokenSecret
          });
          user.data.profile.name = profile.displayName;
          user.data.profile.location = profile._json.location;
          user.data.profile.picture = profile._json.profile_image_url_https;
          user
            .saveUser()
            .then(r => {
              req.flash("info", "Created new account via Twitter!");
              return done(null, user);
            })
            .catch(err => done(err, user));
        }
      );
    }
  )
);

/*
 * Sign in with Google.
 */
passport.use(
  new GoogleStrategy(
    {
      clientID: keysConf.GOOGLE_ID,
      clientSecret: keysConf.GOOGLE_SECRET,
      callbackURL: `${config.url || ""}/auth/google/callback`,
      passReqToCallback: true
    },
    (req, accessToken, refreshToken, profile, done) => {
      db.users.findOne(
        {
          google: profile.id
        },
        (err, doc) => {
          if (err) {
            return done(err);
          }
          if (doc) {
            if (req.user) {
              // reject link attempt
              return res.json({
                meta: {
                  error: true,
                  msg: "This Google account is already linked."
                }
              });
            }
            // log in with existing google account
            return done(null, new User(doc));
          }

          if (req.user) {
            // link Google
            user = new User(req.user.data);
            user.data.google = profile.id;
            user.data.tokens.push({
              kind: "google",
              accessToken
            });

            user.data.profile.name =
              user.data.profile.name || profile.displayName;
            user.data.profile.gender =
              user.data.profile.gender || profile._json.gender;
            user.data.profile.picture =
              user.data.profile.picture || profile._json.picture;

            user
              .saveUser()
              .then(r => {
                req.logIn(r, err => {
                  if (err) {
                    console.error(err);
                    return done(err);
                  }
                  req.flash("info", "Google linked successfully!");
                  return done(null, user);
                });
              })
              .catch(err => done(err, user));
            return;
          }

          // create a Google auth based account, if the email isn't taken
          db.users.findOne(
            {
              email: profile.emails[0].value
            },
            (err, accountsWithThatEmail) => {
              if (err) {
                return done(err);
              }
              if (accountsWithThatEmail) {
                req.flash(
                  "error",
                  "An account with that google email already exists!"
                );
                return done(err);
              } else {
                const user = new User();
                user._meta.noPassword = true;
                user.data.email = profile.emails[0].value;
                user.data.google = profile.id;
                user.data.tokens.push({
                  kind: "google",
                  accessToken
                });
                user.data.profile.name = profile.displayName;
                user.data.profile.gender = profile._json.gender;
                user.data.profile.picture = profile._json.picture;
                user
                  .saveUser()
                  .then(r => {
                    req.logIn(r, err => {
                      if (err) {
                        console.error(err);
                        return done(err);
                      }

                      req.flash("info", "Created new account via Google!");
                      return done(null, user);
                    });
                  })
                  .catch(err => done(err, user));
              }
            }
          );
        }
      );
    }
  )
);

/*
 * Login Required middleware.
 */
exports.isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
};

/*
 * Authorization Required middleware.
 */
exports.isAuthorized = (req, res, next) => {
  const provider = req.path.split("/").slice(-1)[0];
  const token = req.user.data.tokens.find(token => token.kind === provider);
  if (token) {
    return next();
  }

  res.redirect(`/auth/${provider}`);
};
