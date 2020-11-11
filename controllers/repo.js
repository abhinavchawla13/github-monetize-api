const handleError = require("./helper");
const constants = require("../constants");
const firebase = require("../services/firebase");
const github = require("../services/github");
const bcrypt = require("bcryptjs");
const _ = require("lodash");
let User = require("../models/user");
let Repo = require("../models/repo");
let Pointer = require("../models/pointer");

async function getRepoInformation(req, res) {
  try {
    let { uid } = res.locals;
    let user = await User.findOne({ firebaseUID: uid }).select("+githubToken");

    if (!user) {
      throw new Error("User not found");
    }

    const repo = await Repo.findById(req.params.id)
      .populate("markdowns.paymentPointerId")
      .exec();

    if (!repo) {
      throw new Error("Repository not found");
    }

    githubClient = await github.getGithubClient(user.githubToken);
    // get repository(s) information
    githubRepoInfo = await github.getGithubRepoInfo(
      githubClient,
      repo.fullname
    );
    // githubRepoInfo is array, with information in [0] element

    githubBranches = await github.getBranches(githubClient, repo.fullname);
    githubBranches = githubBranches[0]
      .map(branchObj => branchObj.name)
      .reverse();

    if (!githubRepoInfo || !githubRepoInfo[0]) {
      throw new Error("Repository not found under your profile");
    }

    repoInfo = {
      defaultBranch: githubRepoInfo[0].default_branch,
      language: githubRepoInfo[0].language,
      private: githubRepoInfo[0].private,
      markdowns: repo.markdowns,
      updatedAt: repo.updatedAt,
      gitUpdatedAt: githubRepoInfo[0].updated_at,
      name: repo.name,
      fullname: repo.fullname,
      link: repo.link,
      _id: repo._id,
      status: repo.status,
      branches: githubBranches
    };

    return res.status(200).send({
      repo: repoInfo
    });
  } catch (err) {
    return handleError(res, err);
  }
}

async function getUserAllReposName(req, res) {
  try {
    let { uid } = res.locals;
    let user = await User.findOne({ firebaseUID: uid }).select("+githubToken");

    if (!user) {
      throw new Error("User not found");
    }

    githubClient = await github.getGithubClient(user.githubToken);
    // get repository(s) information
    githubReposInfo = await github.getGithubReposInfo(githubClient);

    return res.status(200).send({
      _id: user._id,
      repos: githubReposInfo[0].map(({ name, html_url, full_name }) => ({
        name,
        html_url,
        full_name
      })) // repositories are at [0], extra info is at [1]
    });
  } catch (err) {
    return handleError(res, err);
  }
}

async function connectRepo(req, res) {
  try {
    let { fullname } = req.body;
    let { uid } = res.locals;
    let user = await User.findOne({ firebaseUID: uid })
      .select("+githubToken")
      .populate("repos");

    for (re of user.repos) {
      if (re.fullname == fullname) {
        throw new Error("This repository is already connected.");
      }
    }

    githubClient = await github.getGithubClient(user.githubToken);
    githubRepoInfo = await github.getGithubRepoInfo(githubClient, fullname);
    // githubBranches = await github.getBranches(githubClient, fullname);
    // githubBranches = githubBranches[0].map(branchObj => branchObj.name);

    if (!githubRepoInfo || !githubRepoInfo[0]) {
      throw new Error("Repository not found under your profile");
    }

    // githubRepoInfo is array, with information in [0] element
    const repo = await Repo.create({
      owner: user._id,
      name: githubRepoInfo[0].name,
      fullname: githubRepoInfo[0].full_name,
      status: constants.repoStatus.UNPUBLISHED
    });

    repo.link = `${process.env.BASE_URL}view/${repo._id}`;
    await repo.save();

    user.repos.push(repo._id);
    await user.save();
    return res.status(201).send({
      user
    });
  } catch (err) {
    if (err && err.message && err.message.includes("Not Found")) {
      return res
        .status(401)
        .send({ message: "Repository not found under your profile" });
    }
    return handleError(res, err);
  }
}

async function updateMarkdown(req, res) {
  try {
    const { markdown, branch, paymentPointerId } = req.body;
    let { uid } = res.locals;

    // Check user
    let user = await User.findOne({ firebaseUID: uid });
    if (!user) {
      throw new Error("User not found");
    }

    // Check repo
    const repo = await Repo.findById(req.params.id)
      .populate("markdowns.paymentPointerId")
      .exec();
    if (!repo) {
      throw new Error("Repository not found");
    }
    if (!repo.owner.equals(user._id)) {
      throw new Error("Logged in user does not have permissions");
    }

    // Check pointer
    const pointer = await Pointer.findById(paymentPointerId);
    if (!pointer) {
      throw new Error("Pointer not found");
    }

    // update markdown and paymentPointerId for that branch
    if (repo.markdowns.length > 0) {
      let updated = false;
      for (let i = 0; i < repo.markdowns.length; i++) {
        if (repo.markdowns[i].branch === branch) {
          repo.markdowns[i].value = markdown;
          repo.markdowns[i].paymentPointerId = paymentPointerId;
          updated = true;
        }
      }
      if (!updated) {
        repo.markdowns.push({
          value: markdown,
          branch,
          paymentPointerId
        });
      }
    } else {
      repo.markdowns.push({
        value: markdown,
        branch,
        paymentPointerId
      });
    }

    await repo.save();

    return res.status(200).send({
      repo: repo
    });
  } catch (err) {
    return handleError(res, err);
  }
}

async function publishMarkdown(req, res) {
  try {
    const { id, branch, publishMarkdown } = req.body;
    let { uid } = res.locals;

    let user = await User.findOne({ firebaseUID: uid }).select("+githubToken");
    if (!user) {
      throw new Error("User not found");
    }

    let repo = await Repo.findById(id);
    if (!repo) {
      throw new Error("Repository not found");
    }

    // if (repo.status == constants.repoStatus.PUBLISHED) {
    //   throw new Error("Repo is already published");
    // }

    if (!repo.owner.equals(user._id)) {
      throw new Error("Logged in user does not have permissions");
    }

    let branchExists = false;

    repo.markdowns.forEach(md => {
      if (md.branch === branch) branchExists = true;
    });
    if (!branchExists) {
      throw new Error("Branch does not exist in markdowns");
    }

    // updateMarkdownString = `[![Documento Monetized](https://img.shields.io/badge/documento-monetized-brightgreen?style=for-the-badge)](${process.env.BASE_URL}view/${repo._id}/${branch})\n#### Documentation can be found at:\n## [${process.env.BASE_NAME}](${process.env.BASE_URL}view/${repo._id}/${branch})\nDocument is web monetized. You would need a [Coil](https://coil.com/) membership to view it.`;
    updateMarkdownString = publishMarkdown;

    githubClient = await github.getGithubClient(user.githubToken);
    try {
      currentREADME = await github.getREADME(
        githubClient,
        repo.fullname,
        branch
      );

      await github.addOrUpdateREADME(
        githubClient,
        repo.fullname,
        "Updating README.md (add monetized link)",
        updateMarkdownString,
        currentREADME[0].sha,
        branch
      );
    } catch (err) {
      if (err && err.message && err.message.includes("Not Found")) {
        // create new README file
        await github.addOrUpdateREADME(
          githubClient,
          repo.fullname,
          "Creating README.md (add monetized link)",
          updateMarkdownString,
          "",
          branch
        );
      } else {
        throw new Error(err);
      }
    }

    repo.status = constants.repoStatus.PUBLISHED;

    for (let i = 0; i < repo.markdowns.length; i++) {
      if (repo.markdowns[i].branch == branch) {
        repo.markdowns[i].status = constants.repoStatus.PUBLISHED;
        repo.markdowns[i].publishedMarkdown = updateMarkdownString;
        break;
      }
    }

    await repo.save();

    res.status(200).send({ repo });
  } catch (err) {
    return handleError(res, err);
  }
}

async function unpublishLink(req, res) {
  try {
    const { id, branch } = req.body;
    let { uid } = res.locals;

    let user = await User.findOne({ firebaseUID: uid }).select("+githubToken");
    if (!user) {
      throw new Error("User not found");
    }

    let repo = await Repo.findById(id);
    if (!repo) {
      throw new Error("Repository not found");
    }

    if (!repo.owner.equals(user._id)) {
      throw new Error("Logged in user does not have permissions");
    }

    // if (repo.status == constants.repoStatus.UNPUBLISHED) {
    //   throw new Error("Repo is already unpublished");
    // }

    let branchExists = false;
    let markdown = "";
    repo.markdowns.forEach(md => {
      if (md.branch === branch) {
        branchExists = true;
        markdown = md.value;
      }
    });
    if (!branchExists) {
      throw new Error("Branch does not exist in markdowns");
    }

    githubClient = await github.getGithubClient(user.githubToken);
    try {
      currentREADME = await github.getREADME(
        githubClient,
        repo.fullname,
        branch
      );

      await github.addOrUpdateREADME(
        githubClient,
        repo.fullname,
        "Updating README.md (removing monetized link)",
        markdown,
        currentREADME[0].sha,
        branch
      );
    } catch (err) {
      if (err && err.message && err.message.includes("Not Found")) {
        // create new README file
        await github.addOrUpdateREADME(
          githubClient,
          repo.fullname,
          "Creating README.md (removing monetized link)",
          markdown,
          "",
          branch
        );
      } else {
        throw new Error(err);
      }
    }

    for (let i = 0; i < repo.markdowns.length; i++) {
      if (repo.markdowns[i].branch == branch) {
        repo.markdowns[i].status = constants.repoStatus.UNPUBLISHED;
      }
    }

    await repo.save();

    res.status(200).send({ repo });
  } catch (err) {
    return handleError(res, err);
  }
}

async function getWalletPointer(req, res) {
  try {
    const repo = await Repo.findById(req.params.id).populate("owner");

    if (!repo) {
      throw new Error("Repository not found");
    }

    if (!repo.markdowns || repo.markdowns.length === 0) {
      throw new Error("Repo with branch not found");
    }

    const md = repo.markdowns.filter(md => md.branch === req.params.branch);

    if (!md) {
      throw new Error("Branch not found");
    }

    const pointer = await Pointer.findById(md[0].paymentPointerId);
    if (!pointer) {
      throw new Error("Pointer not found");
    }

    return res
      .status(200)
      .send({ paymentPointer: pointer.link });

  } catch (err) {
    return handleError(res, err);
  }
}

async function getRepoPublicInfo(req, res) {
  try {
    const repo = await Repo.findById(req.params.id).select(
      "name fullname markdowns status"
    );

    if (!repo) {
      throw new Error("Repository not found");
    }

    if (!repo.markdowns || repo.markdowns.length === 0) {
      throw new Error("Repo with branch not found");
    }

    const md = repo.markdowns.filter(md => md.branch === req.params.branch);

    if (!md) {
      throw new Error("Branch not found");
    }

    return res.status(200).send({
      markdown: md[0].value,
      repo: {
        name: repo.name,
        fullname: repo.fullname,
        status: md[0].status
      }
    });
  } catch (err) {
    return handleError(res, err);
  }
}

module.exports = {
  getRepoInformation,
  connectRepo,
  getUserAllReposName,
  updateMarkdown,
  publishMarkdown,
  unpublishLink,
  getWalletPointer,
  getRepoPublicInfo
};
