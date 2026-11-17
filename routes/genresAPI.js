const validadeObjectId = require('../middleware/validadeObjectId');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const express = require('express');
const Joi = require('joi');
const router = express.Router();
const Genres = require('../database/mongoose-db');

router.get('/', async (req, res, next) => {
    const genres = await Genres.find();
    res.send(genres);
});

//FINDING genres
router.get('/:id', validadeObjectId, async (req, res) => {
    const findGenres = await Genres.findById(req.params.id);
    if (!findGenres) {
        res.status(404).send('The genre with the selected ID wasn`t found.');
        return;
    }
    return res.send(findGenres);
});

//CREATING NEW FILM
router.post('/', auth, async (req, res) => {
    const schema = Joi.object({
        name: Joi.string().min(5).max(50).required(),
    });
    const { error } = schema.validate(req.body);

    if (error) {
        res.status(400).send(error.details[0].message);
        return;
    }

    const addGenres = new Genres({
        name: req.body.name,
    });
    const result = await addGenres.save();
    res.send(result);
});

router.put('/:id', [auth, validadeObjectId], async (req, res) => {
    const schema = Joi.object({
        name: Joi.string().min(5).max(50).required(),
    });
    const { error } = schema.validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const genre = await Genres.findByIdAndUpdate(
        req.params.id,
        { name: req.body.name },
        { new: true, runValidators: true },
    );
    if (!genre)
        return res
            .status(404)
            .send('The genre with the selected ID wasn`t found.');
    res.send(genre);
});

router.delete('/:id', [auth, admin, validadeObjectId], async (req, res) => {
    //LOOK UP FILM
    const findGenre = await Genres.findByIdAndDelete(req.params.id);
    if (!findGenre) {
        res.status(404).send('The genre with the selected ID wasn`t found.');
        return;
    }

    res.send('Genre removed successfuly');
});

module.exports = router;
