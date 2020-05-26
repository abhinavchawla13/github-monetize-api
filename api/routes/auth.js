let { Router } = require("express");
let { celebrate, Joi } = require("celebrate");
let constants = require("../../constants");
const logger = require("../../loaders/logger");

let { isAuthenticated, isAuthorized } = require("../../middlewares");

let { login } = require("../../controllers/user");

const route = Router();

module.exports = app => {
  app.use("/auth", route);

  route.post(
    "/login",
    isAuthenticated,
    celebrate({
      body: Joi.object({
        email: Joi.string().required(),
        githubToken: Joi.string().required(),
        photoURL: Joi.string()
      })
    }),
    login
  );
};
