const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schemaOptions = {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  };

let Deletion = new Schema({
    id: {
        type: String,
        required: true
    },
    reason: {
        type: String
    },
}, schemaOptions);



module.exports = mongoose.model('deletion', Deletion);
