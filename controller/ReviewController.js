const ReviewModel = require("../model/ReviewProduct");
const TransactionModel = require("../model/Transaction");
const HTTP_STATUS = require("../constants/statusCodes");
const { success, failure } = require("../util/common");

class ReviewController {
  async createReview(req, res) {
    try {
      const { userId, productId, rating, comment } = req.body;

      // Check if the user has transacted with the given product
      const transaction = await TransactionModel.findOne({
        user: userId,
        "products.id": productId,
      });

      if (!transaction) {
        return res
          .status(HTTP_STATUS.BAD_REQUEST)
          .send(failure("You can only review products you've transacted."));
      }

      // Check if a review already exists for this user and product
      const existingReview = await ReviewModel.findOne({
        user: userId,
        product: productId,
      });

      if (existingReview) {
        return res
          .status(HTTP_STATUS.BAD_REQUEST)
          .send(failure("Review already exists for this user and product"));
      }

      // Create a new review
      const review = new ReviewModel({
        user: userId,
        product: productId,
        rating,
        comment,
      });

      // Save the review to the database
      await review.save();

      return res
        .status(HTTP_STATUS.OK)
        .send(success("Review created successfully", review));
    } catch (error) {
      console.error(error);
      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .send(failure("Internal server error"));
    }
  }

  async getReviewsByProduct(req, res) {
    try {
      const productId = req.params.productId; // Get the product ID from the request parameters

      // Find all reviews for the specified product
      const reviews = await ReviewModel.find({ product: productId })
        .populate("user")
        .exec();

      if (reviews.length === 0) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .send(failure("No reviews found for this product"));
      }

      return res
        .status(HTTP_STATUS.OK)
        .send(success("Reviews retrieved successfully", reviews));
    } catch (error) {
      console.error(error);
      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .send(failure("Internal server error"));
    }
  }
}

module.exports = new ReviewController();
