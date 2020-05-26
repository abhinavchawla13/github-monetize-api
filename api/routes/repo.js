let { Router } = require("express");
let constants = require("../../constants");
let { celebrate, Joi } = require("celebrate");
let { isAuthenticated } = require("../../middlewares");
const route = Router();

let {
  getRepoInformation,
  connectRepo,
  getUserAllReposName,
  updateMarkdown,
  publishMarkdown,
  unpublishLink,
  getWalletPointer,
  getRepoPublicInfo
} = require("../../controllers/repo");

module.exports = app => {
  app.use("/repos", route);

  route.get('/:id', [
    isAuthenticated,
    getRepoInformation
  ])

  route.get('/pointer/:id', [
    getWalletPointer
  ])

  route.get('/public/:id', [
    getRepoPublicInfo
  ])

  route.post('/', [
    isAuthenticated,
    celebrate({
      body: Joi.object({
        fullname: Joi.string().required(),
      })
    }),
    connectRepo
  ])

  route.patch('/:id', [
    isAuthenticated,
    celebrate({
      body: Joi.object({
        markdown: Joi.string().required(),
      })
    }),
    updateMarkdown
  ])

  route.get('/', [
    isAuthenticated,
    getUserAllReposName
  ])

  route.post('/publish', [
    isAuthenticated,
    celebrate({
      body: Joi.object({
        id: Joi.string().required(),
      })
    }),
    publishMarkdown
  ])

  route.post('/unpublish', [
    isAuthenticated,
    celebrate({
      body: Joi.object({
        id: Joi.string().required(),
      })
    }),
    unpublishLink
  ])

};
