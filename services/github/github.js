var github = require("octonode");

exports.getGithubClient = accesstoken => {
  return github.client(accesstoken);
};

exports.getGithubUserInfo = client => {
  ghme = client.me();
  return ghme.infoAsync();
};

exports.getGithubReposInfo = client => {
  ghme = client.me();
  return ghme.reposAsync({
    per_page: 100
  });
};

exports.getGithubRepoInfo = (client, fullname) => {
  ghrepo = client.repo(fullname);
  return ghrepo.infoAsync();
};
exports.getREADME = (client, fullname, branch = "master") => {
  ghrepo = client.repo(fullname);
  return ghrepo.readmeAsync(branch);
};

exports.addOrUpdateREADME = (
  client,
  fullname,
  commitMessage,
  contents,
  sha = "",
  branch = "master"
) => {
  ghrepo = client.repo(fullname);

  if (!sha || sha == "") {
    return ghrepo.createContentsAsync(
      "README.md",
      commitMessage,
      contents,
      branch
    );
  } else {
    return ghrepo.updateContentsAsync(
      "README.md",
      commitMessage,
      contents,
      sha,
      branch
    );
  }
};

exports.getBranches = (client, fullname) => {
  ghrepo = client.repo(fullname);
  return ghrepo.branchesAsync();
};
