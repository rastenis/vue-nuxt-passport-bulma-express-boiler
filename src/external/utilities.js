const utilities = {
  // password hashing function
  makeHash: function makeHash(pass) {
    const hash = bcrypt.hashSync(pass, 12);
    return hash;
  },
  // logger
  log: function log(message, type) {
    if (
      config.production_logging === "all" ||
      process.env.NODE_ENV !== "production"
    ) {
      console.log(message);
    } else if (config.production_logging === "error" && type === 1) {
      console.log(message);
    }
  },
  // a base object for most api responses
  genericResponseObject: function genericResponseObject(message) {
    return {
      meta: {
        error: false,
        msgType: "success",
        msg: message
      }
    };
  },
  genericErrorObject: function genericErrorObject(message) {
    return {
      meta: {
        error: true,
        msgType: "error",
        msg: message || "An error has occured."
      }
    };
  }
};

module.exports = utilities;
