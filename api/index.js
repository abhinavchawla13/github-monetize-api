let { Router } = require("express");
let auth = require("./routes/auth");
let user = require("./routes/user");
let repo = require("./routes/repo");

// guaranteed to get dependencies
module.exports = () => {
  const app = Router();
  auth(app);
  user(app);
  repo(app);

  return app;
};
