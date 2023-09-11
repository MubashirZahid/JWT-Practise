const TransactionModel = require("../model/Transaction");
const ProductModel = require("../model/Product");
const CartModel = require("../model/Cart");
const { success, failure } = require("../util/common");
const HTTP_STATUS = require("../constants/statusCodes");

class Transaction {
  async createTransactionFromCart(req, res) {
    try {
      // Check if the user has a cart
      const cart = await CartModel.findOne({ user: req.body.user });
      if (!cart) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .send(failure("Cart not found for the user"));
      }

      // Create a new transaction based on the cart
      const transaction = new TransactionModel({
        user: req.body.user,
        products: [],
      });

      // Iterate through the products in the cart and update stock
      for (const cartProduct of cart.products) {
        const product = await ProductModel.findById(cartProduct.product);

        if (!product) {
          return res
            .status(HTTP_STATUS.NOT_FOUND)
            .send(failure("Product not found"));
        }

        // Deduct the quantity from product stock
        product.stock -= cartProduct.quantity;

        // Save the updated product
        await product.save();

        // Add the product to the transaction with updated stock
        transaction.products.push({
          id: cartProduct.product,
          quantity: cartProduct.quantity,
          stock: product.stock,
        });
      }

      // Save the transaction
      await transaction.save();

      // Remove the user's cart after creating the transaction
      await CartModel.findByIdAndRemove(cart._id);

      return res
        .status(HTTP_STATUS.OK)
        .send(success("Transaction created successfully", transaction));
    } catch (error) {
      console.log(error);
      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .send(failure("Internal server error"));
    }
  }

  async getAllTransaction(req, res) {
    try {
      const transactions = await TransactionModel.find({})
        .populate("user")
        .populate("products.id") // Populate the 'id' field within the 'products' array
        .exec();

      if (transactions) {
        return res.status(HTTP_STATUS.OK).send(
          success("Successfully retrieved all transactions", {
            transactions,
          })
        );
      }

      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .send(failure("No transactions found"));
    } catch (error) {
      console.error(error);
      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .send(failure("Internal server error"));
    }
  }
}

module.exports = new Transaction();
