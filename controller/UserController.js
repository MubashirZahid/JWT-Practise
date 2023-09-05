const UserModel = require("../model/User");
const { success, failure } = require("../util/common");
const HTTP_STATUS = require("../constants/statusCodes");

class User {
  async addNewUser(req, res) {
    console.log("Create function starts");
    try {
      const { name, email, role } = req.body;
      console.log(name, email, role);

      const newUser = await UserModel.create({ name, email, role });
      if (newUser) {
        return res.status(HTTP_STATUS.OK).send(
          success("Successfully created new User", {
            message: newUser,
          })
        );
      }
      return res
        .status(HTTP_STATUS.OK)
        .send(failure("Failed to add a new User"));
    } catch (error) {
      console.log(error);
      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .send(failure("Internal server error"));
    }
  }
}

module.exports = new User();
