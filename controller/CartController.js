const CartModel = require("../model/Cart");
const ProductModel = require("../model/Product");
const UserModel = require("../model/User");
const { success, failure } = require("../util/common");
const { validationResult } = require("express-validator");
const HTTP_STATUS = require("../constants/statusCodes");

class CartController {
  async addNewCart(req, res) {
    try {
      const { userId, productId, quantity } = req.body;

      // Check if the user exists
      const user = await UserModel.findById(userId);
      if (!user) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .send(failure("User not found"));
      }

      // Check if the product exists
      const product = await ProductModel.findById(productId);
      if (!product) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .send(failure("Product not found"));
      }

      // Check if a cart already exists for the user
      let cart = await CartModel.findOne({ user: userId });

      if (!cart) {
        // If no cart exists, create a new cart
        cart = new CartModel({
          user: userId,
          products: [],
          total: 0,
        });
      }

      // Check if the product is already in the cart
      const existingProductIndex = cart.products.findIndex(
        (item) => item.product.toString() === productId
      );

      if (existingProductIndex !== -1) {
        // If the product is already in the cart, calculate the new quantity
        const newQuantity =
          cart.products[existingProductIndex].quantity + quantity;

        // Check if the new quantity exceeds the available stock
        if (newQuantity > product.stock) {
          return res.status(HTTP_STATUS.BAD_REQUEST).send(
            failure(`Quantity exceeds available stock for ${product.title}`, {
              product,
            })
          );
        }

        // Update the quantity
        cart.products[existingProductIndex].quantity = newQuantity;
      } else {
        // If the product is not in the cart, add it with the given quantity
        if (quantity > product.stock) {
          return res.status(HTTP_STATUS.BAD_REQUEST).send(
            failure(`Quantity exceeds available stock for ${product.title}`, {
              product,
            })
          );
        }

        cart.products.push({
          product: productId,
          quantity: quantity,
        });
      }

      // Update the total based on the products in the cart
      cart.total = cart.products.reduce((acc, item) => {
        const productPrice = product.price;
        return acc + item.quantity * productPrice;
      }, 0);

      // Save the cart
      await cart.save();

      return res
        .status(HTTP_STATUS.OK)
        .send(success("Cart updated successfully", cart));
    } catch (error) {
      console.log(error);
      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .send(failure("Internal server error"));
    }
  }

  async removeFromCart(req, res) {
    try {
      const { userId, productId, quantityToRemove } = req.body;

      // Check if the user exists
      const user = await UserModel.findById(userId);
      if (!user) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .send(failure("User not found"));
      }

      // Check if a cart exists for the user
      let cart = await CartModel.findOne({ user: userId });

      if (!cart) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .send(failure("Cart not found for the user"));
      }

      // Find the product index in the cart
      const productIndex = cart.products.findIndex(
        (item) => item.product.toString() === productId
      );

      if (productIndex === -1) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .send(failure("Product not found in the cart"));
      }

      // Get the product AND price
      const product = await ProductModel.findById(productId);
      if (!product) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .send(failure("Product not found"));
      }
      const productPrice = product.price;

      // Decrease the quantity
      cart.products[productIndex].quantity -= quantityToRemove;

      // If the quantity becomes zero or negative, remove the product from the cart
      if (cart.products[productIndex].quantity <= 0) {
        cart.products.splice(productIndex, 1);
      }

      // Update the total based on the products in the cart
      cart.total = cart.products.reduce((acc, item) => {
        return acc + item.quantity * productPrice;
      }, 0);

      // Save the updated cart
      await cart.save();

      return res
        .status(HTTP_STATUS.OK)
        .send(success("Product removed from cart", cart));
    } catch (error) {
      console.log(error);
      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .send(failure("Internal server error"));
    }
  }
}

module.exports = new CartController();
