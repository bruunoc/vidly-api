const auth = require('../middleware/auth');
const express = require('express');
const Joi = require('joi');
const Movies = require('../database/moviesDb');
const Genres = require('../database/mongoose-db');
const router = express.Router();

router.get('/', async (req, res) => {
    const movies = await Movies.find();
    res.send(movies);
});

router.post('/', auth, async (req, res) => {
    const schema = Joi.object({
        name: Joi.string()
            .min(3)
            .required()
            .pattern(/^[A-Za-z\s]+$/),
        genreId: Joi.string().required(),
        numberInStock: Joi.number().min(0).max(255).required(),
        dailyRentalRate: Joi.number().min(0).max(255).required(),
    });
    const error = schema.validate(req.body).error;
    if (error) {
        res.status(400).send(error.details[0].message);
        return;
    }

    const genreId = req.body.genreId;
    const genre = await Genres.findById(genreId);
    if (!genre) {
        res.status(400).send('The genre with the given ID wasn`t found.');
        return;
    }

    const createMovies = new Movies({
        name: req.body.name,
        genre: genre,
        numberInStock: req.body.numberInStock,
        dailyRentalRate: req.body.dailyRentalRate,
    });
    const result = await createMovies.save();
    res.send(result);
});

module.exports = router;
