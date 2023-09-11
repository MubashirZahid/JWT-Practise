const express = require("express");
const router = express.Router();
const UserController = require("../controller/UserController");
const AuthController = require("../controller/AuthController");
const { validateEmailAndPassword } = require("../middleware/validation");
const { validateAuthorization } = require("../middleware/auth");

router.post("/addNewUser", UserController.addNewUser);
router.post("/signUp", validateEmailAndPassword.signup, AuthController.signUp);
router.post("/logIn", AuthController.logIn);

router.get("/get-all", AuthController.getAll);
router.get("/get-users-by-rating", AuthController.getSortedUsers);
router.get("/get-users-by-filtering", AuthController.getFilteredUsers);
router.get("/get-users-by-searching", AuthController.searchByMultipleFields);

module.exports = router; // Export the router instance
