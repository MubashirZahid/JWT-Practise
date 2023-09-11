const bcrypt = require("bcrypt");
const Auth = require("../model/Auth");
const User = require("../model/User");
const { validationResult } = require("express-validator");
const { success, failure } = require("../util/common");
const HTTP_STATUS = require("../constants/statusCodes");
const jasonwebtoken = require("jsonwebtoken");

class AuthController {
  async signUp(req, res) {
    try {
      // Check for validation errors
      const validation = validationResult(req).array();
      if (validation.length > 0) {
        return res
          .status(HTTP_STATUS.OK)
          .send(failure("Failed to add user", validation));
      }

      // Extract email and password from request body
      const { email, password, name, role, rating } = req.body;

      // Check if the email is already registered
      const existingUser = await Auth.findOne({ email });
      if (existingUser) {
        return res
          .status(HTTP_STATUS.CONFLICT)
          .send(failure("Email already registered"));
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
      // Create and save a new Auth document with email and hashed password
      const result = await Auth.create({
        name: name,
        email: email,
        password: hashedPassword,
        role: role,
        rating: rating,
      });

      return res
        .status(HTTP_STATUS.CREATED)
        .send(success("User registered successfully", result));
    } catch (error) {
      console.error(error);
      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .send(failure("Internal server error"));
    }
  }

  async logIn(req, res) {
    const { email, password } = req.body;

    const auth = await Auth.findOne({ email: email });

    if (!auth) {
      return res.status(HTTP_STATUS.OK).send(failure("User is not registerd"));
    }
    const checkPassword = await bcrypt.compare(password, auth.password);
    console.log(checkPassword);
    if (!checkPassword) {
      return res.status(HTTP_STATUS.OK).send(failure("Invalid Credentials"));
    }

    const responseAuth = auth.toObject();
    delete responseAuth.password;
    delete responseAuth._id;

    const jwt = jasonwebtoken.sign(responseAuth, process.env.SECRET_KEY, {
      expiresIn: "1h",
    });

    responseAuth.token = jwt;

    return res
      .status(HTTP_STATUS.OK)
      .send(success("Successfully Logged in", responseAuth));
  }

  // Today's Work
  async getAll(req, res) {
    try {
      const { page, limit } = req.query;
      if (page < 1 || limit < 0) {
        return res
          .status(HTTP_STATUS.UNPROCESSABLE_ENTITY)
          .send(failure("Page and limit values must be at least 1 or 0"));
      }
      const users = await Auth.find({})
        .skip((page - 1) * limit)
        .limit(limit);

      if (users.length === 0) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .send(failure("No products were found"));
      }

      return res.status(HTTP_STATUS.OK).send(
        success("Successfully received all users", {
          countPerPage: users.length,
          page: parseInt(page),
          users: users,
        })
      );
    } catch (error) {
      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .send(failure("Internal server error"));
    }
  }

  async getSortedUsers(req, res) {
    try {
      const { sortOrder } = req.query;
      const { page, limit } = req.query;

      if (page < 1 || limit < 0) {
        return res
          .status(HTTP_STATUS.UNPROCESSABLE_ENTITY)
          .send(failure("Page and limit values must be at least 1 or 0"));
      }

      // Defining the sort order based on sortOrder
      let sortDirection;

      if (sortOrder === "asc") {
        sortDirection = 1;
      } else if (sortOrder === "des") {
        sortDirection = -1;
      } else {
        return res
          .status(HTTP_STATUS.UNPROCESSABLE_ENTITY)
          .send(failure("Please give valid request"));
      }

      // Sort the users by rating in the specified order
      const users = await Auth.find({})
        .sort({ rating: sortDirection })
        .skip((page - 1) * limit)
        .limit(limit);

      if (users.length === 0) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .send(failure("No users found"));
      }

      return res.status(HTTP_STATUS.OK).send(
        success("Successfully received sorted users", {
          countPerPage: users.length,
          page: parseInt(page),
          users: users,
        })
      );
    } catch (error) {
      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .send(failure("Internal server error"));
    }
  }

  // async getFilteredUsers(req, res) {
  //   try {
  //     const { sortOrder, sortParam } = req.query;
  //     const { page, limit } = req.query;

  //     if (page < 1 || limit < 0) {
  //       return res
  //         .status(HTTP_STATUS.UNPROCESSABLE_ENTITY)
  //         .send(failure("Page and limit values must be at least 1 or 0"));
  //     }

  //     // Defining the sort query based on sortOrder and sortParam
  //     const sortQuery = {};
  //     if (sortOrder === "greater") {
  //       sortQuery.rating = { $gt: parseFloat(sortParam) };
  //     } else if (sortOrder === "lesser") {
  //       sortQuery.rating = { $lt: parseFloat(sortParam) };
  //     } else {
  //       return res
  //         .status(HTTP_STATUS.UNPROCESSABLE_ENTITY)
  //         .send(failure("Please give valid request"));
  //     }

  //     // Use the sortQuery to filter and sort users
  //     const users = await Auth.find(sortQuery)
  //       .skip((page - 1) * limit)
  //       .limit(limit);

  //     if (users.length === 0) {
  //       return res
  //         .status(HTTP_STATUS.NOT_FOUND)
  //         .send(failure("No users found"));
  //     }

  //     return res.status(HTTP_STATUS.OK).send(
  //       success("Successfully received filtered and sorted users", {
  //         countPerPage: users.length,
  //         page: parseInt(page),
  //         users: users,
  //       })
  //     );
  //   } catch (error) {
  //     return res
  //       .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
  //       .send(failure("Internal server error"));
  //   }
  // }

  async getFilteredUsers(req, res) {
    try {
      const { sortOrder, sortParam, search, page, limit } = req.query;

      if (page < 1 || limit < 0) {
        return res
          .status(HTTP_STATUS.UNPROCESSABLE_ENTITY)
          .send(failure("Page and limit values must be at least 1 or 0"));
      }

      // Defining the sort query based on sortOrder and sortParam
      const sortQuery = {};
      if (sortOrder === "greater") {
        sortQuery.rating = { $gt: parseFloat(sortParam) };
      } else if (sortOrder === "lesser") {
        sortQuery.rating = { $lt: parseFloat(sortParam) };
      } else {
        return res
          .status(HTTP_STATUS.UNPROCESSABLE_ENTITY)
          .send(failure("Please give valid request"));
      }

      // Define the search query using regex for the name field
      const searchQuery = {};
      if (search) {
        searchQuery.name = { $regex: new RegExp(search, "i") };
      }

      // Combine the sortQuery and searchQuery using $and
      const combinedQuery = { $and: [sortQuery, searchQuery] };

      // Use the combinedQuery to filter, sort, and search for users
      const users = await Auth.find(combinedQuery)
        .skip((page - 1) * limit)
        .limit(limit);

      if (users.length === 0) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .send(failure("No users found"));
      }

      return res.status(HTTP_STATUS.OK).send(
        success("Successfully received filtered, sorted, and searched users", {
          countPerPage: users.length,
          page: parseInt(page),
          users: users,
        })
      );
    } catch (error) {
      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .send(failure("Internal server error"));
    }
  }

  async searchByMultipleFields(req, res) {
    try {
      const { email, rating, name } = req.query;

      // Defining an array to store the search conditions
      const searchConditions = [];

      if (email) {
        searchConditions.push({ email: { $regex: new RegExp(email, "i") } });
      }

      if (rating) {
        searchConditions.push({ rating: { $gte: parseFloat(rating) } });
      }

      if (name) {
        // name = name.toLowerCase();
        searchConditions.push({ name: { $regex: new RegExp(name, "i") } });
      }

      // Combine the search conditions using the $or operator
      const searchQuery = { $or: searchConditions };

      // Use the searchQuery to find users matching any of the specified fields
      const users = await Auth.find(searchQuery);

      if (users.length === 0) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .send(failure("No users found"));
      }

      return res.status(HTTP_STATUS.OK).send(
        success("Successfully received users ", {
          Length: users.length,
          users,
        })
      );
    } catch (error) {
      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .send(failure("Internal server error"));
    }
  }
}

module.exports = new AuthController();
