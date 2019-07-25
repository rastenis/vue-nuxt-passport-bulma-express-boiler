const Datastore = require("nedb");
const fs = require("fs-extra");

/*
A single database for user data
*/
let db;

// ensuring folder
fs.ensureDir("db/").then(()=>{
  db = {
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
});



module.exports = db;
