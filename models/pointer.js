let mongoose = require("mongoose");
var Schema = mongoose.Schema;

const PointerSchema = new mongoose.Schema({
  link: String,
  reposLinked: [
    {
      type: Schema.Types.ObjectId,
      ref: "Repo"
    }
  ]
});

const Pointer = mongoose.model("Pointer", PointerSchema);
module.exports = Pointer;
