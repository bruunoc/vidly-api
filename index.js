const winston = require('winston');
const express = require('express');
const app = express();

// LOGGING ERRORS TO FILE AND MONGODB AND HANDLING UNCAUGHT EXCEPTIONS AND UNHANDLED REJECTIONS.
require('./start/logging')();
// CHECKING FOR JWT PRIVATE KEY.
require('./start/config')();
// CONNECTING TO MONGODB
require('./start/db')();

require('./start/prod')(app);
// MIDDLEWARES ROUTES.
require('./start/routes')(app);

const port = process.env.PORT || 4000;
const server = app.listen(port, () =>
    winston.info(`Listening on port ${port}`),
);

module.exports = server;
