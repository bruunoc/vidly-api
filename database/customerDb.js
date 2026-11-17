const mongoose = require('mongoose');
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

const Customers = mongoose.model('Customers', customerSchema);
module.exports = Customers;
