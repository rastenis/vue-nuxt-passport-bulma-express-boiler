const config = require("../../config/config.json");

const utilities = {
  // logger
  log: function log(message, type = 0) {
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
