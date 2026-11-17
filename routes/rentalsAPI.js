//const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const express = require('express');
const Joi = require('joi');
Joi.ObjectId = require('joi-objectid')(Joi);
const Rentals = require('../database/rentalsDb');
const Customers = require('../database/customerDb');
const Movies = require('../database/moviesDb');
const router = express.Router();

router.get('/', async (req, res) => {
    const rentals = await Rentals.find();
    res.send(rentals);
});

router.post('/', auth, async (req, res) => {
    const schema = Joi.object({
        customerId: Joi.ObjectId().required(),
        movieId: Joi.ObjectId().required(),
    });

    const { error } = schema.validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const customer = await Customers.findById(req.body.customerId);
    if (!customer) return res.status(400).send('Invalid customer.');

    const movie = await Movies.findById(req.body.movieId);
    if (!movie) return res.status(400).send('Invalid movie.');

    if (movie.numberInStock === 0)
        return res.status(400).send('Movie not in stock.');

    const rental = new Rentals({
        customer: customer,
        movie: movie,
    });


await rental.save();
await Movies.updateOne({ _id: movie._id }, { $inc: { numberInStock: -1 } });
res.send(rental);

});
//     const session = await mongoose.startSession();
//     session.startTransaction();
//     try {
//         await rental.save({ session });
//         await Movies.updateOne(
//             { _id: movie._id },
//             { $inc: { numberInStock: -1 } },
//             { session },
//         );
//         await session.commitTransaction();
//         res.send(rental);
//     } catch (ex) {
//         await session.abortTransaction();
//         res.status(500).send('Something failed.');
//     } finally {
//         session.endSession();
//     }
// });

module.exports = router;
