// const ProductModel = require("../model/Product");
const { validationResult } = require("express-validator");
const UserModel = require("../model/User");
const { success, failure } = require("../util/common");
const { logAction } = require("../server/logger");
const HTTP_STATUS = require("../constants/statusCodes");

class Product {
  async getAll(req, res) {
    try {
      const users = await UserModel.find({});
      if (users.length > 0) {
        return res.status(HTTP_STATUS.OK).send(
          success("Successfully received all users", {
            result: users,
            total: users.length,
          })
        );
      }
      return res.status(HTTP_STATUS.OK).send(success("No users were found"));
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

      await UserModel.findById({ _id: id })
        .then((object) => {
          return res
            .status(HTTP_STATUS.OK)
            .send(success("Successfully received the user", user));
        })
        .catch((error) => {
          return res
            .status(HTTP_STATUS.OK)
            .send(failure("Failed to received the user"));
        });
    } catch (error) {
      console.log(error);
      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .send(failure("Internal server error"));
    }
  }

  async addNewProduct(req, res) {
    try {
      // const validation = validationResult(req).array();
      // if (validation.length > 0) {
      //   return res
      //     .status(HTTP_STATUS.OK)
      //     .send(failure("Failed to add the user", validation));
      // }
      const { id, name, email } = req.body;
      const user = new UserModel({
        id: id,
        name: name,
        email: email,
      });
      // Using the then and catch to handle separate responses on success and failure
      await user
        .save()
        .then((data) => {
          return res
            .status(HTTP_STATUS.OK)
            .send(success("Successfully added the user", data));
        })
        .catch((err) => {
          console.log(err);
          return res
            .status(HTTP_STATUS.UNPROCESSABLE_ENTITY)
            .send(failure("Failed to add the user"));
        });
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

      const updatedUser = await UserModel.findByIdAndUpdate(id, updatedData, {
        new: true,
      });
      console.log(updatedUser);

      if (updatedUser) {
        return res
          .status(HTTP_STATUS.OK)
          .send(success("Successfully updated the user", updatedUser));
      } else {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .send(failure("User not found"));
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
      const deletedUser = await UserModel.findByIdAndDelete(id);

      if (deletedUser) {
        return res
          .status(HTTP_STATUS.OK)
          .send(success("Successfully deleted the user", deletedUser));
      } else {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .send(failure("User not found"));
      }
    } catch (error) {
      console.log(error);
      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .send(failure("Internal server error"));
    }
  }

  async getTopRatedProducts(req, res) {
    try {
      const topRatedProducts = await ProductModel.getTopRatedProducts();
      if (topRatedProducts.success) {
        return res
          .status(200)
          .send(
            success(
              "Successfully retrieved top rated products",
              topRatedProducts.data
            )
          );
      } else {
        res.status(500).send(failure(topRatedProducts.message));
      }
    } catch (error) {
      return res.status(500).send(failure("Internal server error"));
    }
  }

  async getTopCheapestProducts(req, res) {
    try {
      const topCheapestProducts = await ProductModel.getTopCheapestProducts();
      if (topCheapestProducts.success) {
        return res
          .status(200)
          .send(
            success(
              "Successfully retrieved top cheapest products",
              topCheapestProducts.data
            )
          );
      } else {
        res.status(400).send(failure(topCheapestProducts.message));
      }
    } catch (error) {
      return res.status(500).send(failure("Internal server error"));
    }
  }

  async deleteAllProducts(req, res) {
    try {
      const result = await ProductModel.deleteAllProducts();
      if (result.success) {
        logAction("Deleted all products");
        return res.status(200).send(success(result.message));
      } else {
        res.status(400).send(failure(result.message));
      }
    } catch (error) {
      return res.status(500).send(failure("Internal server error"));
    }
  }
}

module.exports = new Product();
