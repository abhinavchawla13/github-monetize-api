const handleError = require("./helper");
const constants = require("../constants");
const firebase = require("../services/firebase");
const github = require("../services/github");
const bcrypt = require("bcryptjs");
const _ = require("lodash");
let User = require("../models/user");

async function login(req, res) {
  try {
    let { email, githubToken, photoURL } = req.body;
    let { uid } = res.locals;

    let user = await User.findOne({ firebaseUID: uid }).select('+githubToken')

    // new user, so we will create it in our db
    if (!user) {
      console.info('New user will be created')
      // create github client with access token
      githubClient = await github.getGithubClient(githubToken)

      // get user information
      githubUserInfo = await github.getGithubUserInfo(githubClient);

      if (!githubUserInfo || !githubUserInfo[0] || !githubUserInfo[0]['login']) {
        throw new Error('Github profile could not be found.')
      }

      const githubUsername = githubUserInfo[0]['login'];
      let user = await User.create({
        githubId: githubUsername,
        email: email,
        firebaseUID: uid,
        photoURL: photoURL,
        githubToken: githubToken,
      });

      return res.status(201).send({
        user
      });
    }
    else {
      user.githubToken = githubToken;
      await user.save();
      // user already exists
      return res.status(201).send({
        user
      });
    }

  } catch (err) {
    return handleError(res, err);
  }
}

async function getUserReposInformation(req, res) {
  try {
    let { uid } = res.locals;
    let user = await User.findOne({ firebaseUID: uid }).populate('repos')

    if (!user) {
      throw new Error('User not found')
    }

    return res.status(200).send({
      repos: user.repos
    })

  } catch (err) {
    return handleError(res, err);
  }
}

async function addWalletPointer(req, res) {
  try {
    let { paymentPointer } = req.body;
    let { uid } = res.locals;
    let user = await User.findOne({ firebaseUID: uid })

    user.paymentPointer = paymentPointer;
    await user.save();

    return res.status(201).send({
      user
    });
  }
  catch (err) {
    return handleError(res, err);
  }
}


module.exports = {
  login,
  getUserReposInformation,
  addWalletPointer
};
