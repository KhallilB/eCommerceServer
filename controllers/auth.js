// Dependincies
const jwt = require('jsonwebtoken');
const passport = require('passport');

const User = require('../models/User');

// Saves user to database, retruns
// confirmation string along with a token
const signUp = async (req, res) => {
  // Create new user object
  const user = await new User();

  user.firstName = req.body.firstName;
  user.lastName = req.body.lastName;
  user.email = req.body.email;
  user.password = req.body.password;

  // Save new user check for errors,
  // if no errors create and send token
  await user.save((err, savedUser) => {
    if (err) {
      console.log(err);
      return res.json({ err }).status(500);
    } else {
      const payload = { subject: savedUser };
      const token = jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXP }
      );

      return res
        .cookie('cellaCookie', token, {
          maxAge: 99999,
          httpOnly: true
        })
        .status(200)
        .send({
          message: 'Cookie has been sent to client '
        });
    }
  });
};

// Authorizes a previously registered user,
// return a token
const logIn = async (req, res) => {
  await passport.authenticate(
    'local',
    (err, user, data) => {
      if (err) {
        console.log(err);
        return res.json(err).status(500);
      }

      if (user) {
        const payload = { subject: user };
        const token = jwt.sign(
          payload,
          process.env.JWT_SECRET,
          { expiresIn: process.env.JWT_EXP }
        );

        res
          .cookie('cellaCookie', token, {
            maxAge: 99999,
            httpOnly: true
          })
          .status(200)
          .send({
            message: 'Cookie has been sent to client '
          });
      } else return res.status(401).json(data);
    }
  )(req, res);
};

// Export Auth functions
module.exports = {
  signUp,
  logIn
};
