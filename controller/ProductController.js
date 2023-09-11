const { validationResult } = require("express-validator");
const Product = require("../model/Product");
const { success, failure } = require("../util/common");
const HTTP_STATUS = require("../constants/statusCodes");

class ProductController {
  async addNewProduct(req, res) {
    try {
      const { title, price, rating, stock } = req.body; // Include 'stock' in the destructuring
      const product = new Product({
        title,
        price,
        rating,
        stock, // Include 'stock' in the object
      });

      await product.save();

      return res
        .status(HTTP_STATUS.OK)
        .send(success("Successfully added the product", product));
    } catch (error) {
      console.log(error);
      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .send(failure("Internal server error"));
    }
  }

  async updateById(req, res) {
    try {
      const { id } = req.params;
      const updatedData = req.body;

      const updatedProduct = await Product.findByIdAndUpdate(id, updatedData, {
        new: true,
      });

      if (updatedProduct) {
        return res
          .status(HTTP_STATUS.OK)
          .send(success("Successfully updated the product", updatedProduct));
      } else {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .send(failure("Product not found"));
      }
    } catch (error) {
      console.log(error);
      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .send(failure("Internal server error"));
    }
  }

  async deleteById(req, res) {
    try {
      const { id } = req.params;

      const deletedProduct = await Product.findByIdAndDelete(id);

      if (deletedProduct) {
        return res
          .status(HTTP_STATUS.OK)
          .send(success("Successfully deleted the product", deletedProduct));
      } else {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .send(failure("Product not found"));
      }
    } catch (error) {
      console.log(error);
      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .send(failure("Internal server error"));
    }
  }

  async getAll(req, res) {
    try {
      const products = await Product.find({});

      if (products.length > 0) {
        return res.status(HTTP_STATUS.OK).send(
          success("Successfully received all products", {
            result: products,
            total: products.length,
          })
        );
      }
      return res.status(HTTP_STATUS.OK).send(success("No products were found"));
    } catch (error) {
      console.log(error);
      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .send(failure("Internal server error"));
    }
  }

  async getOneById(req, res) {
    try {
      const { id } = req.params;

      const product = await Product.findById(id);

      if (product) {
        return res
          .status(HTTP_STATUS.OK)
          .send(success("Successfully received the product", product));
      } else {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .send(failure("Product not found"));
      }
    } catch (error) {
      console.log(error);
      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .send(failure("Internal server error"));
    }
  }
}
module.exports = new ProductController();
