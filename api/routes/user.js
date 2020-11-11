let { Router } = require("express");
let constants = require("../../constants");
let { celebrate, Joi } = require("celebrate");
let { isAuthenticated } = require("../../middlewares");
const route = Router();

let {
  getUserInformation,
  addWalletPointer,
  removeWalletPointer,
  updateWalletPointer,
  getUserReposInformation
} = require("../../controllers/user");

module.exports = app => {
  app.use("/users", route);

  route.get("/", [isAuthenticated, getUserInformation]);

  route.patch("/wallet/add", [
    isAuthenticated,
    celebrate({
      body: Joi.object({
        paymentPointer: Joi.string().required()
      })
    }),
    addWalletPointer
  ]);

  route.patch("/wallet/remove", [
    isAuthenticated,
    celebrate({
      body: Joi.object({
        paymentPointerId: Joi.string().required()
      })
    }),
    removeWalletPointer
  ]);

  route.patch("/wallet/update", [
    isAuthenticated,
    celebrate({
      body: Joi.object({
        paymentPointer: Joi.string().required(),
        paymentPointerId: Joi.string().required()
      })
    }),
    updateWalletPointer
  ]);
};
