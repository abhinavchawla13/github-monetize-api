let expressLoader = require("./express");
// let dependencyInjectorLoader = require( "./dependencyInjector");
let mongooseLoader = require("./mongoose");
// let jobsLoader = require( "./jobs");
let Logger = require("./logger");
//We have to import at least all the events once so they can be triggered
// let "./events";
let { Container } = require("typedi");

module.exports = async app => {
  const mongoConnection = await mongooseLoader();
  Logger.info("✌️ DB loaded and connected!");

  await expressLoader(app);
  Logger.info("✌️ Express loaded");
};
