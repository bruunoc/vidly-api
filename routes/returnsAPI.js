const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const express = require('express');
const Joi = require('joi');
Joi.ObjectId = require('joi-objectid')(Joi);
const Rentals = require('../database/rentalsDb');
const Movies = require('../database/moviesDb');
const router = express.Router();

function validateReturn(req) {
    const schema = Joi.object({
        customerId: Joi.ObjectId().required(),
        movieId: Joi.ObjectId().required(),
    });
    return schema.validate(req);
}

router.post('/', [auth, validate(validateReturn)], async (req, res) => {
    const rental = await Rentals.lookup(req.body.customerId, req.body.movieId);

    if (!rental) return res.status(404).send('Rental not found.');

    if (rental.dateReturned)
        return res.status(400).send('Return already processed.');

    rental.return();
    await rental.save();

    await Movies.updateOne(
        { _id: rental.movie._id },
        { $inc: { numberInStock: 1 } },
    );

    res.send(rental);
});

module.exports = router;
