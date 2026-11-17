const mongoose = require('mongoose');
const genresSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 50,
    },
});

const Genres = mongoose.model('Genres', genresSchema);
module.exports = Genres;
