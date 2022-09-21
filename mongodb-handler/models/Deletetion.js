const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let Deletion = new Schema({
    username: {
        type: String,
        required: true
    },
    id: {
        type: String,
        required: true
    },
    timestamp: {
        type: String
    },
    reason: {
        type: String
    }
});



module.exports = mongoose.model('deletion', Deletion);
