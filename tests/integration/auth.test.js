const request = require('supertest');
const User = require('../../database/userDb');
const Genres = require('../../database/mongoose-db');

let server;

describe('auth middleware', () => {
    beforeEach(() => {
        server = require('../../index');
    });

    afterEach(async () => {
        await new Promise((resolve) => server.close(resolve));
        await Genres.deleteMany({});
    });

    let token;

    beforeEach(() => {
        token = new User().generateAuthToken();
    });
    const exec = () => {
        return request(server)
            .post('/api/genres')
            .set('x-auth-token', token)
            .send({ name: 'genre1' });
    };
    it('Should return 401 if no token is provided', async () => {
        token = '';
        const res = await exec();
        expect(res.status).toBe(401);
    });

    it('Should return 400 if token is invalid', async () => {
        token = 'a';
        const res = await exec();
        expect(res.status).toBe(400);
    });

    it('Should return 200 if token is valid', async () => {
        const res = await exec();
        expect(res.status).toBe(200);
    });
});
