const express = require('express');
const app = express();
const compression = require('compression');
const session = require('express-session');

/**
 * Sample api routes
 */
const users = require('./routes/users');

/**
 * API keys and Passport configuration.
 */
const passportConfig = require('./config/passportConfig.js');

// Use API Routes
app.use(users);

// Export the server middleware
module.exports = {
  path: '/api',
  handler: app
}