var service = require("./firebase");

module.exports = {
  createUser: service.createUser,
  setCustomUserClaims: service.setCustomUserClaims,
  listUsers: service.listUsers,
  getUser: service.getUser,
  updateUser: service.updateUser,
  deleteUser: service.deleteUser,
  verifyIdToken: service.verifyIdToken
};
