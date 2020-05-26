var github = require('octonode');

exports.getGithubClient = accesstoken => {
    return github.client(accesstoken)
}

exports.getGithubUserInfo = client => {
    ghme = client.me();
    return ghme.infoAsync();
}

exports.getGithubReposInfo = client => {
    ghme = client.me();
    return ghme.reposAsync();
}

exports.getGithubRepoInfo = (client, fullname) => {
    ghrepo = client.repo(fullname);
    return ghrepo.infoAsync();
}
exports.getREADME = (client, fullname) => {
    ghrepo = client.repo(fullname);
    return ghrepo.readmeAsync();

    return ghrepo.contentsAsync('README.md');

    // return ghrepo.updateContentsAsync('README.md', commitMessage, contents, sha);
}

exports.addOrUpdateREADME = (client, fullname, commitMessage, contents, sha = '') => {
    ghrepo = client.repo(fullname);

    if (!sha || sha == '') {
        return ghrepo.createContentsAsync('README.md', commitMessage, contents);
    }
    else {
        return ghrepo.updateContentsAsync('README.md', commitMessage, contents, sha);
    }
}