const config = require("../config/config.json");
let baseURL= config["self_hosted"]?`http://${config.url}}`:`http://localhost:${config.port}`

module.exports = require('axios').create({
  baseURL: baseURL,
});