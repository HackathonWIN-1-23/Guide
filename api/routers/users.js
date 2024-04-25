const express = require('express');
const mongoose = require('mongoose');
const {OAuth2Client} = require('google-auth-library');
const config = require('../config.js');
const crypto = require('crypto');
const fs = require('fs');
const fetch = require('node-fetch');
const path = require('path');
const {imagesUpload} = require('../multer.js');
const User = require('../models/User');

const usersRouter = express.Router();
const client = new OAuth2Client(config.google.clientId);

usersRouter.post('/', imagesUpload.single('avatar'), async (req, res, next) => {
  try {
    const user = new User({
      username: req.body.username,
      password: req.body.password,
      displayName: req.body.displayName,
      avatar: req.file ? req.file.filename : null,
    });

    user.generateToken();
    await user.save();
    return res.send({message: 'Success', user});
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      return res.status(400).send(error);
    }

    return next(error);
  }
});
//
// usersRouter.get("/", async (req, res, next) => {
//   const users = await User.find();
//
//   try {
//     return res.send({message: 'Username and password correct!', users});
//   } catch (e) {
//     return next(e);
//   }
// });

usersRouter.post('/sessions', async (req, res, next) => {
  const user = await User.findOne({username: req.body.username});

  if (!user) {
    return res.status(400).send({error: 'Username not found'});
  }

  const isMatch = await user.checkPassword(req.body.password);

  if (!isMatch) {
    return res.status(400).send({error: 'Password is wrong'});
  }

  try {
    user.generateToken();
    await user.save();

    return res.send({message: 'Username and password correct!', user});
  } catch (e) {
    return next(e);
  }

});

const downloadFile = async (url, filename) => {
  const response = await fetch(url);
  const fileStream = fs.createWriteStream(filename);
  await new Promise((resolve, reject) => {
    response.body.pipe(fileStream);
    response.body.on("error", (err) => {
      reject(err);
    });
    fileStream.on("finish", function () {
      resolve();
    });
  });
};

usersRouter.post('/google', async (req, res, next) => {
  try {
    const ticket = await client.verifyIdToken({
      idToken: req.body.credential,
      audience: config.google.clientId,
    });

    const payload = ticket.getPayload();

    if (!payload) {
      return res.status(400).send({ error: "Google login error!" });
    }

    const email = payload["email"];
    const googleId = payload["sub"];

    if (!email) {
      return res.status(400).send({error: 'Not enough user data'});
    }

    let user = await User.findOne({googleId});

    if (!user) {
      const displayName = payload["name"];
      const avatar = payload["picture"];

      const imageRandomId = crypto.randomUUID();

      if (!avatar) {
        return res.status(400).send({error: 'Not enough user data'});
      }
      const imagePath = path.join(config.publicPath, 'images', imageRandomId + '.jpg');

      await downloadFile(avatar, imagePath);
      user = new User({
        username: email,
        password: crypto.randomUUID(),
        displayName,
        googleId,
        avatar: 'images/' + imageRandomId + '.jpg',
      });
    }

    user.generateToken();
    await user.save();

    return res.send({message: 'Login with Google successful!', user});
  } catch (e) {
    return next(e);
  }
});


usersRouter.delete('/sessions', async (req, res, next) => {
  try {
    const token = req.get('Authorization');
    const success = {message: 'OK'};

    if (!token) {
      return res.send(success);
    }

    const user = await User.findOne({token});

    if (!user) {
      return res.send(success);
    }

    user.generateToken();
    await user.save();
    return res.send(success);
  } catch (e) {
    return next(e);
  }
});

module.exports = usersRouter;
