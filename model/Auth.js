const mongoose = require("mongoose");

const authSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: Number, // 1 = admin, 2 = regular
    required: false,
    default: 2,
  },
  rating: {
    type: Number,
    required: true,
  },
});

const AuthModel = mongoose.model("Auth", authSchema);

module.exports = AuthModel;
