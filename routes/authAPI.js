const config = require('config');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const _ = require('lodash');
const express = require('express');
const Joi = require('joi');
const Users = require('../database/userDb');
const router = express.Router();

router.post('/', async (req, res) => {
    const schema = Joi.object({
        email: Joi.string().email().required().min(5).max(100).messages({
            'string.email': 'Please enter a valid email address.',
        }),
        password: Joi.string().min(5).max(70).required(),
    });
    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).send(error.details[0].message);
    }

    let user = await Users.findOne({ email: req.body.email });
    if (!user) {
        return res.status(400).send('Invalid email or password.');
    }

    const validPassword = await bcrypt.compare(
        req.body.password,
        user.password,
    );
    if (!validPassword) {
        return res.status(400).send('Invalid email or password.');
    }

    const token = user.generateAuthToken();

    res.send(token);
});

module.exports = router;
