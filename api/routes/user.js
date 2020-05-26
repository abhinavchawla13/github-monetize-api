let { Router } = require("express");
let constants = require("../../constants");
let { celebrate, Joi } = require("celebrate");
let { isAuthenticated } = require("../../middlewares");
const route = Router();

let { getUserReposInformation, addWalletPointer } = require("../../controllers/user");

module.exports = app => {
  app.use("/users", route);

  route.get('/repos', [
    isAuthenticated,
    getUserReposInformation
  ])

  route.patch('/wallet', [
    isAuthenticated,
    celebrate({
      body: Joi.object({
        paymentPointer: Joi.string().required(),
      })
    }),
    addWalletPointer
  ])

};
