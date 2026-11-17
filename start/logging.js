const winston = require('winston');
require('winston-mongodb');
const config = require('config');

module.exports = function () {
    winston.add(
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple(),
            ),
        }),
    );
    winston.add(new winston.transports.File({ filename: 'logfile.log' }));
    winston.add(
        new winston.transports.MongoDB({
            db: config.get('db'),
            level: 'info',
        }),
    );
    winston.exceptions.handle(
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'uncaughtExceptions.log' }),
    );
    winston.rejections.handle(
        new winston.transports.File({ filename: 'unhadledRejections.log' }),
    );
};
