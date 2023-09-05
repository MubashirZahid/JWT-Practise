const express = require("express");
const routes = express();
const ProductController = require("../controller/ProductController");
const TransactionController = require("../controller/TransactionController");
const { isAuthorized } = require("../middleware/auth");

const {
  createValidation,
  updateValidation,
} = require("../middleware/validation");

routes.get("/", isAuthorized, ProductController.getAll);
routes.get("/getOneById/:id", ProductController.getOneById);
routes.delete("/deleteById/:id", ProductController.deleteById);

routes.post("/addNewProduct", ProductController.addNewProduct);
routes.put("/updateById/:id", ProductController.updateById);

routes.get("/topRated", ProductController.getTopRatedProducts);
routes.get("/topCheapest", ProductController.getTopCheapestProducts);
routes.delete("/deleteAll", ProductController.deleteAllProducts);

routes.post("/create", TransactionController.create);
routes.get("/getAllTransactions", TransactionController.getAllTransaction);

module.exports = routes;
