const auth = require('../middleware/auth');
const validadeObjectId = require('../middleware/validadeObjectId');
const express = require('express');
const Joi = require('joi');
const Customers = require('../database/customerDb');
const router = express.Router();

router.get('/', async (req, res) => {
    const customers = await Customers.find();
    res.send(customers);
});

router.get('/:id', validadeObjectId, async (req, res) => {
    const customer = await Customers.findById(req.params.id);
    if (!customer) {
        res.status(404).send('The customer with the selected ID wasn`t found.');
        return;
    }
    res.send(customer);
});

router.post('/', auth, async (req, res) => {
    const schema = Joi.object({
        name: Joi.string().min(3).max(50).required(),
        isGold: Joi.boolean().required(),
        phone: Joi.string().min(3).max(50).required(),
    });

    const { error } = schema.validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const customer = new Customers({
        name: req.body.name,
        isGold: req.body.isGold,
        phone: req.body.phone,
    });

    await customer.save();
    res.send(customer);
});

router.put('/:id', [auth, validadeObjectId], async (req, res) => {
    const schema = Joi.object({
        name: Joi.string().min(3).max(50).required(),
        isGold: Joi.boolean().required(),
        phone: Joi.string().min(3).max(50).required(),
    });

    const { error } = schema.validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const customer = await Customers.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            isGold: req.body.isGold,
            phone: req.body.phone,
        },
        { new: true, runValidators: true },
    );

    if (!customer) return res.status(404).send('Customer not found.');

    res.send(customer);
});

router.delete('/:id', [auth, validadeObjectId], async (req, res) => {
    const customer = await Customers.findByIdAndDelete(req.params.id);
    if (!customer)
        return res.status(404).send('Customer with the given ID not found.');

    res.send(customer);
});

module.exports = router;
