const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    products: {
      type: [
        {
          id: { type: mongoose.Types.ObjectId, ref: "Product" },
          quantity: Number,
        },
      ],
      required: true,
    },
  },
  { timestamps: true }
);

// userSchema.index({ id: Number });

const Transaction = mongoose.model("Transaction", transactionSchema);
module.exports = Transaction;
