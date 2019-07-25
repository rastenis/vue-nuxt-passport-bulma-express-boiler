const Datastore = require("nedb");

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
db.users.ensureIndex(
  {
    fieldName: "email",
    unique: true,
    sparse: true
  },
  function(err) {
    if (err) {
      console.error(err);
    }
  }
);

module.exports = db;