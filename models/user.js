let mongoose = require("mongoose");
var Schema = mongoose.Schema;


const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Please enter user's email"],
      unique: true
    },
    photoURL: {
      type: String,
    },
    firebaseUID: {
      type: String,
      required: [true, "Firebase UID not passed"],
      unique: true,
      index: true
    },
    githubId: {
      type: String,
      required: [true, "GitHub ID not provided"]
    },
    githubToken: {
      type: String,
      required: [true, "GitHub Token not provided"],
      select: false
    },
    paymentPointer: {
      type: String
    },
    repos: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Repo',
      }
    ]
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);
module.exports = User;
