const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Username was not provided"],
    maxLength: 30,
  },
  price: {
    type: Number,
    required: [true, "Price was not provided"],
    maxLength: 10,
  },
  rating: {
    type: Number,
    required: [true, "Rating was not provided"],
    maxLength: 10,
  },
});

// userSchema.index({ id: Number });

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
