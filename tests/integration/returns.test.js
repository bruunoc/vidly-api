const request = require('supertest');
const mongoose = require('mongoose');
const User = require('../../database/userDb');
const Rentals = require('../../database/rentalsDb');
const Movies = require('../../database/moviesDb');

// POST /api/returns { customerId, movieId }
//
// Test cases:
// Return 401 if client is not logged in
// Return 400 if customerId is not provided
// Return 400 if movieId is not provided
// Return 404 if no rental found for this customer/movie
// Return 400 if rental already processed
// Return 200 if valid request
// Set the return date
// Calculate the rental fee
// Increase the movie stock
// Return the rental

let server;

describe('/api/returns', () => {
    let customerId;
    let movieId;
    let rental;
    let movie;
    let token;

    const exec = async () => {
        return await request(server)
            .post('/api/returns')
            .set('x-auth-token', token)
            .send({ customerId, movieId });
    };

    beforeEach(async () => {
        server = require('../../index');

        customerId = new mongoose.Types.ObjectId();
        movieId = new mongoose.Types.ObjectId();
        token = new User().generateAuthToken();

        // movie saved in the database (needed to test the stock)
        movie = new Movies({
            _id: movieId,
            name: 'movie1',
            genre: { name: 'genre1' },
            numberInStock: 10,
            dailyRentalRate: 2,
        });
        await movie.save();

        // rental saved in the database (the one that will be returned)
        rental = new Rentals({
            customer: {
                _id: customerId,
                name: 'customer1',
                isGold: false,
                phone: '12345',
            },
            movie: {
                _id: movieId,
                name: 'movie1',
                dailyRentalRate: 2,
            },
        });
        await rental.save();
    });

    afterEach(async () => {
        await new Promise((resolve) => server.close(resolve));
        await Rentals.deleteMany({});
        await Movies.deleteMany({});
    });

    it('Should return 401 if client is not logged in', async () => {
        token = '';
        const res = await exec();

        expect(res.status).toBe(401);
    });

    it('Should return 400 if customerId is not provided', async () => {
        customerId = '';
        const res = await exec();

        expect(res.status).toBe(400);
    });

    it('Should return 400 if movieId is not provided', async () => {
        movieId = '';
        const res = await exec();

        expect(res.status).toBe(400);
    });

    it('Should return 404 if no rental found for this customer/movie', async () => {
        await Rentals.deleteMany({});
        const res = await exec();

        expect(res.status).toBe(404);
    });

    it('Should return 400 if rental already processed', async () => {
        rental.dateReturned = new Date();
        await rental.save();

        const res = await exec();

        expect(res.status).toBe(400);
    });

    it('Should return 200 if it is a valid request', async () => {
        const res = await exec();

        expect(res.status).toBe(200);
    });

    it('Should set the return date if input is valid', async () => {
        await exec();

        const rentalInDb = await Rentals.findById(rental._id);
        const diff = new Date() - rentalInDb.dateReturned; // in milliseconds

        expect(diff).toBeLessThan(10 * 1000); // less than 10 seconds ago
    });

    it('Should calculate the rental fee if input is valid', async () => {
        // pretend the movie was rented 7 days ago
        const sevenDays = 7 * 24 * 60 * 60 * 1000;
        rental.dateOut = new Date(Date.now() - sevenDays);
        await rental.save();

        await exec();

        const rentalInDb = await Rentals.findById(rental._id);
        expect(rentalInDb.rentalFee).toBe(14); // 7 days * dailyRentalRate 2
    });

    it('Should increase the movie stock if input is valid', async () => {
        await exec();

        const movieInDb = await Movies.findById(movieId);
        expect(movieInDb.numberInStock).toBe(movie.numberInStock + 1);
    });

    it('Should return the rental if input is valid', async () => {
        const res = await exec();

        expect(Object.keys(res.body)).toEqual(
            expect.arrayContaining([
                'dateOut',
                'dateReturned',
                'rentalFee',
                'customer',
                'movie',
            ]),
        );
    });
});
