const jsonwebtoken = require("jsonwebtoken");
const HTTP_STATUS = require("../constants/statusCodes");
const { failure } = require("../util/common");
const express = require("express");

const isAuthorized = (req, res, next) => {
  try {
    if (!req.headers.authorization) {
      return res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .send(failure("Unauthorized access"));
    }
    const jwt = req.headers.authorization.split(" ")[1];
    const validate = jsonwebtoken.verify(jwt, process.env.SECRET_KEY);
    if (validate) {
      next();
    } else {
      throw new Error();
    }
  } catch (error) {
    if (error instanceof jsonwebtoken.JsonWebTokenError) {
      return res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .send(failure("Token Invalid"));
    }
    if (error instanceof jsonwebtoken.TokenExpiredError) {
      return res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .send(failure("Token Expired"));
    }
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send(failure("Token expired"));
  }
};

module.exports = { isAuthorized };
