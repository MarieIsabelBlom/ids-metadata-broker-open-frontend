const Deletion = require('../models/Deletion');

function addDeletion(id, timestamp, reason) {
  Deletion.findOne({ id })
    .then(deletion => {
      if (!deletion) {
        new Deletion({
          id,
          reason: 'test'
        }).save()
          .then(timestamp => {
            console.log('Created new DB for Deletion ');
          })
      }
    })
}

module.exports = addDeletion;
