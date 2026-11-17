const User = require('../../../database/userDb');
const auth = require('../../../middleware/auth');
const mongoose = require('mongoose');

describe('auth middleware', () => {
    it('Should populate req.user with the payload of a valid JWT', () => {
        const payload = {
            _id: new mongoose.Types.ObjectId().toHexString(),
            isAdmin: true,
        };

        const token = new User(payload).generateAuthToken();
        const req = { header: jest.fn().mockReturnValue(token) };
        const res = {};
        const next = jest.fn();

        auth(req, res, next);
        expect(req.user).toMatchObject(payload);
        expect(req.user).toBeDefined();
        expect(next).toHaveBeenCalled();
    });
});
