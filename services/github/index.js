var service = require("./github");

module.exports = {
  getGithubClient: service.getGithubClient,
  getGithubUserInfo: service.getGithubUserInfo,
  getGithubReposInfo: service.getGithubReposInfo,
  getGithubRepoInfo: service.getGithubRepoInfo,
  getREADME: service.getREADME,
  addOrUpdateREADME: service.addOrUpdateREADME,
  getBranches: service.getBranches
};
