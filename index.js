const winston = require('winston');
const express = require('express');
const app = express();

// LOGGING ERRORS TO FILE AND MONGODB AND HANDLING UNCAUGHT EXCEPTIONS AND UNHANDLED REJECTIONS.
require('./start/logging')();
// CHECKING FOR JWT PRIVATE KEY.
require('./start/config')();
// CONNECTING TO MONGODB
require('./start/db')();
// MIDDLEWARES ROUTES.
require('./start/routes')(app);

require('./start/prod')(app);

const port = process.env.PORT || 4000;
const server = app.listen(port, () =>
    winston.info(`Listening on port ${port}`),
);

module.exports = server;
