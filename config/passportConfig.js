require("dotenv").config();
const passport = require("passport");
const request = require("request");
const {
  Strategy: LocalStrategy
} = require("passport-local");
const {
  Strategy: TwitterStrategy
} = require("passport-twitter");
const {
  OAuth2Strategy: GoogleStrategy
} = require("passport-google-oauth");

const db = require("../src/external/db.js");
const keysConf = require("../passportKeys.json");
const User = require("../src/controllers/user.js");

passport.serializeUser((user, done) => {
  done(null, user.data._id);
});

passport.deserializeUser((id, done) => {
  db.users.findOne({
    _id: id
  }, (err, user) => {
    if (err) {
      console.error(err);
    }
    user = new User(user);
    done(err, user);
  });
});

/*
 * Sign in using Email and Password.
 */
passport.use(
  new LocalStrategy({
    usernameField: "email"
  }, (email, password, done) => {
    db.users.findOne({
      email: email.toLowerCase()
    }, (err, user) => {
      console.log(user);
      if (err) {
        return done(err);
      }
      if (!user) {
        return done(null, false, {
          msg: `Email ${email} not found.`
        });
      }

      user = new User(user);
      user.comparePassword(password, (err, isMatch) => {
        if (err) {
          return done(err);
        }
        if (isMatch) {
          return done(null, user);
        }
        return done(null, false, {
          msg: "Invalid email or password."
        });
      });
    });
  })
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
  new TwitterStrategy({
      consumerKey: keysConf.TWITTER_KEY,
      consumerSecret: keysConf.TWITTER_SECRET,
      callbackURL: "/auth/twitter/callback",
      passReqToCallback: true
    },
    (req, accessToken, tokenSecret, profile, done) => {
      if (typeof req.user !== 'undefined') {
        db.users.findOne({
          twitter: profile.id
        }, (err, existingUser) => {
          if (err) {
            return done(err);
          }
          if (existingUser) {
            //TODO: message
            //This twitter account is already linked.
            return done(err);
          }

          // linking twitter with existing logged in account
          db.users.findOne({
            _id: req.user.data._id
          }, (err, user) => {
            if (err) {
              return done(err);
            }
            user = new User(user);
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
                req.logIn(r.data, (err) => {
                  if (err) {
                    console.error(err);
                    return next(err);
                  }
                });
                // TODO: alert user about successful link
                done(err, user);
              })
              .catch(e => done(err));
          });

        });
      } else {
        // creating a brand new account with twitter
        db.users.findOne({
          twitter: profile.id
        }, (err, existingUser) => {
          if (err) {
            return done(err);
          }
          if (existingUser) {
            return done(null, new User(existingUser));
          }
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
              //TODO: message
              // created an account witch twitter successfully 
              done(null, user);
            })
            .catch(err => {
              done(err, user);
            });
        });
      }
    }
  )
);

/*
 * Sign in with Google.
 */
passport.use(
  new GoogleStrategy({
      clientID: keysConf.GOOGLE_ID,
      clientSecret: keysConf.GOOGLE_SECRET,
      callbackURL: "/auth/google/callback",
      passReqToCallback: true
    },
    (req, accessToken, refreshToken, profile, done) => {
      if (typeof req.user !== 'undefined') { //linking google with existing account
        db.users.findOne({
          google: profile.id
        }, (err, doc) => {
          if (err) {
            return done(err);
          }
          if (doc) {
            res.json({
              meta: {
                error: true,
                msg: "This google account is already linked."
              },
            });
            done(err);
          } else {
            // fetching the existing logged in user & linking it with the google account
            db.users.findOne({
              _id: req.user.data._id
            }, (err, user) => {
              if (err) {
                return done(err);
              }
              user = new User(user);
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
                user.data.profile.picture || profile._json.image.url;
              user
                .saveUser()
                .then(r => {
                  req.logIn(r.data, (err) => {
                    if (err) {
                      console.error(err);
                      return next(err);
                    }

                    // TODO: message
                    console.log("google linked to existing account!");
                    done(null, user);

                  });
                })
                .catch(err => {
                  done(err, user);
                });
            });
          }
        });
      } else {
        db.users.findOne({
          google: profile.id
        }, (err, doc) => {
          if (err) {
            return done(err);
          }
          if (doc) {
            // log in with existing google account
            return done(null, new User(doc));
          }

          // create a google account
          db.users.findOne({
              email: profile.emails[0].value
            },
            (err, accountsWithThatEmail) => {
              if (err) {
                return done(err);
              }
              if (accountsWithThatEmail) {

                console.log("already an account with that email address");
                /// TODO: message
                done(err);
              } else {
                console.log("making new account with google");

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
                user.data.profile.picture = profile._json.image.url;
                user
                  .saveUser()
                  .then(r => {
                    req.logIn(r.data, (err) => {
                      if (err) {
                        console.error(err);
                        return next(err);
                      }

                      // TODO: message
                      console.log("google account created!");
                      done(null, user);

                    });
                  })
                  .catch(err => {
                    done(err, user);
                  });
              }
            }
          );
        });
      }
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
    next();
  } else {
    res.redirect(`/auth/${provider}`);
  }
};