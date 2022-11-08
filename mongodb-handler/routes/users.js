const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

require('dotenv/config')
const secret = process.env.JWT_SECRET

router.get('/', auth, (req, res) => {
    User.find(function(err, users) {
        if (err) {
            console.log(err);
        }
        else {
            // Response gets all existing users
            res.json(users);
        }
    });
});

router.post('/add', auth, admin, async (req, res) => {
  try {
      const { username, password } = req.body;

      // Simple validation
      if(!username || !password) {
        return res.status(400).json({
          msg: 'Please enter Username and Password'
        })
      }

      // Check existing user
      await User.findOne({ username })
        .then(user => {
          if(user) return res.status(400).json({ msg: 'User already exists'})

          new User(req.body).save()
            .then(user => {
              res.json(user)
            })
        })
  } catch (err) {
      res.status(500).json({ msg: 'Network error'});
  }
})

router.post('/update/:id', auth, admin, function(req, res) {
    User.findById(req.params.id, function(err, user) {
        if (!user) {
            console.log(`Data NOT found: ${req.params.id}`);
            res.status(404).send(`Data NOT found: ${req.params.id}`);
        }
        else {
            user.firstname = req.body.firstname;
            user.surname = req.body.surname;
            user.ids_participants = req.body.ids_participants;
            user.role = req.body.role;

            user.save().then(user => {
                res.json(user);
                console.log(`Updated User on the DB: ${req.params.id}`);
            })
            .catch(err => {
                res.status(400).send("Update not possible");
            });
        }
    });
});

router.delete('/delete/:id', auth, admin, function(req, res) {
    User.findByIdAndRemove(req.params.id, function(err,user) {
        if (err) {
            console.log(err);
        } else {
            console.log(`Deleted User from the DB: ${req.params.id}`);
            res.json(user);
        }
    });
});


module.exports = router;
