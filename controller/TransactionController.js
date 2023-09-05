const TransactionModel = require("../model/Transaction");
const ProductModel = require("../model/Product");
const { success, failure } = require("../util/common");
const HTTP_STATUS = require("../constants/statusCodes");

class Transaction {
  async create(req, res) {
    console.log("Create function starts");
    try {
      const { user, products } = req.body;
      console.log(products);

      //   // Calculate the total price
      //   let totalPrice = 0;
      //   for (const product of products) {
      //     totalPrice += product.price * product.quantity;
      //   }

      const newTransaction = await TransactionModel.create({ user, products });
      if (newTransaction) {
        return res.status(HTTP_STATUS.OK).send(
          success("Successfully created new Transaction", {
            message: newTransaction,
            // totalPrice: totalPrice,
          })
        );
      }
      return res
        .status(HTTP_STATUS.OK)
        .send(failure("Failed to add Transaction"));
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
