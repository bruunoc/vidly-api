const express = require('express');
const genresAPI = require('../routes/genresAPI');
const customersAPI = require('../routes/customerAPI');
const rentalsAPI = require('../routes/rentalsAPI');
const usersAPI = require('../routes/usersAPI');
const movies = require('../routes/moviesAPI');
const auth = require('../routes/authAPI');
const returnsAPI = require('../routes/returnsAPI');
const error = require('../middleware/error');

module.exports = function (app) {
    app.use(express.json());
    app.use('/api/genres', genresAPI);
    app.use('/api/customers', customersAPI);
    app.use('/api/movies', movies);
    app.use('/api/rentals', rentalsAPI);
    app.use('/api/users', usersAPI);
    app.use('/api/auth', auth);
    app.use('/api/returns', returnsAPI);
    app.use(error);
};
