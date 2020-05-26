let mongoose = require("mongoose");
let constants = require("../constants")
var Schema = mongoose.Schema;

const RepoSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide repository name"],
    },
    fullname: {
      type: String,
      required: [true, "Please provide full repository name"],
      unique: true
    },
    status: {
      type: String,
      default: constants.repoStatus.UNPUBLISHED,
      enum: [constants.repoStatus.UNPUBLISHED, constants.repoStatus.PUBLISHED]
    },
    link: {
      type: String,
      default: ""
    },
    markdown: {
      type: String,
      default: ""
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    }
  },
  { timestamps: true }
);

const Repo = mongoose.model("Repo", RepoSchema);
module.exports = Repo;
