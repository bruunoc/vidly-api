const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
    name: { type: String, required: true, minlength: 3, maxlength: 50 },
    dailyRentalRate: { type: Number, required: true, min: 0 },
});

const customerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 50,
    },
    isGold: { type: Boolean, required: true },
    phone: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 50,
    },
});

const rentalSchema = new mongoose.Schema({
    movie: {
        type: movieSchema,
        required: true,
    },
    customer: {
        type: customerSchema,
        required: true,
    },
    dateOut: {
        type: Date,
        default: Date.now,
        required: true,
    },
    dateReturned: {
        type: Date,
    },
    rentalFee: {
        type: Number,
        min: 0,
    },
});

// STATIC METHOD: called on the model -> Rentals.lookup(customerId, movieId)
// Finds the rental of a specific customer and movie.
rentalSchema.statics.lookup = function (customerId, movieId) {
    return this.findOne({
        'customer._id': customerId,
        'movie._id': movieId,
    });
};

// INSTANCE METHOD: called on a document -> rental.return()
// Sets the return date and calculates the rental fee.
rentalSchema.methods.return = function () {
    this.dateReturned = new Date();

    const oneDay = 24 * 60 * 60 * 1000; // milliseconds in one day
    const rentalDays = Math.floor((this.dateReturned - this.dateOut) / oneDay);
    this.rentalFee = rentalDays * this.movie.dailyRentalRate;
};

const Rentals = mongoose.model('Rentals', rentalSchema);
module.exports = Rentals;
