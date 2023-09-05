const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Username was not provided"],
    maxLength: 30,
  },
  email: {
    type: String,
    required: true,
  },
  role: {
    type: Number, // 1 = admin, 2 = regular
    required: false,
    default: 2,
  },
});

// userSchema.index({ id: Number });

const User = mongoose.model("User", userSchema);
module.exports = User;
