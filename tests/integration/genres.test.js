const request = require('supertest');
const mongoose = require('mongoose');
const User = require('../../database/userDb');
const Genres = require('../../database/mongoose-db');

let server;

describe('/api/genres', () => {
    beforeEach(() => {
        server = require('../../index');
    });
    afterEach(async () => {
        await new Promise((resolve) => server.close(resolve));
        await Genres.deleteMany({}); //clean all datas after close the server.
    });

    describe('GET/', () => {
        it('Should return all genres', async () => {
            await Genres.collection.insertMany([
                { name: 'genre1' },
                { name: 'genre2' },
            ]);
            const res = await request(server).get('/api/genres');
            expect(res.status).toBe(200);
            expect(res.body.length).toBe(2);
        });
    });

    describe('GET/:id', () => {
        it('Should return a genre if valid id is passed', async () => {
            const genre = new Genres({ name: 'genre1' });
            await genre.save();
            const res = await request(server).get('/api/genres/' + genre._id);

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('name', genre.name);
        });
        it('Should return 404 if invalid id is passed', async () => {
            const res = await request(server).get('/api/genres/_id');
            expect(res.status).toBe(404);
        });
    });

    describe('POST/', () => {
        // Define the happy path, and then in each test, we change one parameter
        // that clearly alifns with the name of the test.

        let token;
        let name;

        const exec = async () => {
            return await request(server)
                .post('/api/genres')
                .set('x-auth-token', token)
                .send({ name });
        };

        beforeEach(() => {
            token = new User().generateAuthToken();
            name = 'genre1';
        });

        it('Should return 401 if client is not logged in', async () => {
            token = '';
            const res = await exec();

            expect(res.status).toBe(401);
        });
        it('Should return 400 if genre is less than 5 characters', async () => {
            name = '1234';
            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('Should return 400 if genre is more than 50 characters', async () => {
            name = new Array(52).join('a'); // creates a string with 51 'a' characters

            const res = await exec();
            expect(res.status).toBe(400);
        });

        it('Should save the genre if it is valid', async () => {
            await exec();
            const genre = await Genres.findOne({ name: name });

            expect(genre).not.toBeNull();
        });

        it('Should save the genre if it is valid', async () => {
            const res = await exec();

            expect(res.body).toHaveProperty('_id');
            expect(res.body).toHaveProperty('name', name);
        });
    });

    describe('PUT/:id', () => {
        // Happy path: a logged in user updates a genre that exists.
        // Each test changes only one variable.

        let token;
        let genre;
        let id;
        let newName;

        const exec = async () => {
            return await request(server)
                .put('/api/genres/' + id)
                .set('x-auth-token', token)
                .send({ name: newName });
        };

        beforeEach(async () => {
            // create a genre in the database to be updated
            genre = new Genres({ name: 'genre1' });
            await genre.save();

            token = new User().generateAuthToken();
            id = genre._id;
            newName = 'updatedName';
        });

        it('Should return 401 if client is not logged in', async () => {
            token = '';
            const res = await exec();

            expect(res.status).toBe(401);
        });

        it('Should return 400 if genre is less than 5 characters', async () => {
            newName = '1234';
            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('Should return 400 if genre is more than 50 characters', async () => {
            newName = new Array(52).join('a'); // 51 characters
            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('Should return 404 if genre with the given id was not found', async () => {
            id = new mongoose.Types.ObjectId(); // valid id, but not in the database
            const res = await exec();

            expect(res.status).toBe(404);
        });

        it('Should update the genre if input is valid', async () => {
            await exec();
            const updatedGenre = await Genres.findById(genre._id);

            expect(updatedGenre.name).toBe(newName);
        });

        it('Should return the updated genre if input is valid', async () => {
            const res = await exec();

            expect(res.body).toHaveProperty('_id');
            expect(res.body).toHaveProperty('name', newName);
        });
    });

    describe('DELETE/:id', () => {
        // Happy path: an admin deletes a genre that exists.
        // Each test changes only one variable.

        let token;
        let genre;
        let id;

        const exec = async () => {
            return await request(server)
                .delete('/api/genres/' + id)
                .set('x-auth-token', token)
                .send();
        };

        beforeEach(async () => {
            // create a genre in the database to be deleted
            genre = new Genres({ name: 'genre1' });
            await genre.save();

            token = new User({ isAdmin: true }).generateAuthToken(); // only admins can delete
            id = genre._id;
        });

        it('Should return 401 if client is not logged in', async () => {
            token = '';
            const res = await exec();

            expect(res.status).toBe(401);
        });

        it('Should return 403 if the user is not an admin', async () => {
            token = new User({ isAdmin: false }).generateAuthToken();
            const res = await exec();

            expect(res.status).toBe(403);
        });

        it('Should return 404 if genre with the given id was not found', async () => {
            id = new mongoose.Types.ObjectId(); // valid id, but not in the database
            const res = await exec();

            expect(res.status).toBe(404);
        });

        it('Should delete the genre if input is valid', async () => {
            await exec();
            const genreInDb = await Genres.findById(id);

            expect(genreInDb).toBeNull();
        });

        it('Should return 200 if the genre was deleted', async () => {
            const res = await exec();

            expect(res.status).toBe(200);
        });
    });
});
