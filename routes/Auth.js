const express = require("express");
const router = express.Router();
const UserController = require("../controller/UserController");
const AuthController = require("../controller/AuthController");
const { validateEmailAndPassword } = require("../middleware/validation");
const { validateAuthorization } = require("../middleware/auth");

router.post("/addNewUser", UserController.addNewUser);
router.post("/signUp", validateEmailAndPassword.signup, AuthController.signUp);
router.post("/logIn", AuthController.logIn);

module.exports = router; // Export the router instance
