const express = require("express");
const routes = express();
const ProductController = require("../controller/ProductController");
const UserController = require("../controller/UserController");
const CartController = require("../controller/CartController");
const TransactionController = require("../controller/TransactionController");
const ReviewController = require("../controller/ReviewController");
const { isAuthorized } = require("../middleware/auth");

const { cartValidator } = require("../middleware/validation");

routes.get("/", isAuthorized, ProductController.getAll);
routes.get("/getOneById/:id", ProductController.getOneById);
routes.delete("/deleteById/:id", ProductController.deleteById);

routes.post("/addNewProduct", ProductController.addNewProduct);
routes.put("/updateById/:id", ProductController.updateById);

// routes.get("/topRated", ProductController.getTopRatedProducts);
// routes.get("/topCheapest", ProductController.getTopCheapestProducts);
// routes.delete("/deleteAll", ProductController.deleteAllProducts);

// routes.post("/addNewUsers", UserController.addNewUser);
routes.post("/api/addNewCarts", CartController.addNewCart);
routes.post("/api/removeCarts", CartController.removeFromCart);
routes.post(
  "/api/addToTransactions",
  TransactionController.createTransactionFromCart
);
routes.post("/api/reviewProducts", ReviewController.createReview);
routes.get(
  "/api/getReviewedProducts/:productId",
  ReviewController.getReviewsByProduct
);

// routes.post("/create", TransactionController.create);
// routes.get("/getAllTransactions", TransactionController.getAllTransaction);

module.exports = routes;
