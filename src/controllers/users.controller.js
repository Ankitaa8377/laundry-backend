var User = require("../models/user");
var bcrypt = require("bcrypt");

const Login = (req, res) => {
  const { email, password } = req.body;
  console.log("email, password", email, password);
  User.isUserExists(email).then((isExists) => {
    if (!isExists) {
      return res.status(400).json({
        status: "failed",
        message: "user not exist!",
        statusCode: "400",
      });
    }
    User.getOneUser(email).then(
      (user) => {
        bcrypt.compare(
          password,
          user.password,
          function (error, isvalidpassword) {
            if (error) {
              throw error;
            }
            if (!isvalidpassword) {
              return res.status(401).json({
                status: "failed",
                message: "invalid password!",
                statusCode: "401",
              });
            } else {
              const user_id = user.id;
              const email = user.email;
              res.status(200).send({
                message: "Login successfully",
                status: "true",
                statusCode: "200",
                user_id: user_id,
                email: email,
              });
            }
          }
        );
      },
      (error) => {
        res.status(400).json({
          status: "false",
          statusCode: "400",
          message: "Error while login.",
        });
      }
    );
  });
};

const Register = async function (req, res) {
  User.isUserExists(req.body.email).then((isExists) => {
    if (isExists) {
      return res.status(400).json({
        message:
          "This email address is already in use. Please try a different one",
        statusCode: "400",
      });
    } else {
      let { email, password, phone } = JSON.parse(JSON.stringify(req.body));
      User.AddUser({
        email,
        password,
        phone,
      })
        .then(async function (result) {
          return res.status(200).json({
            message: "Succesfully! user Added",
            statusCode: "200",
          });
        })
        .catch(function (error) {
          return res.status(400).json({
            message: error,
            statusCode: "400",
          });
        });
    }
  });
};
// const oderPlace = async function (req, res) {
//   req.body.cart.map((data) => {
//     User.AddOder(req.body, data)
//       .then(async function (result) {
//         return res.status(200).json({
//           message: "Succesfully! user Added",
//           statusCode: "200",
//         });
//       })
//       .catch(function (error) {
//         return res.status(400).json({
//           message: error,
//           statusCode: "400",
//         });
//       });
//   });
// };

const oderPlace = async function (req, res) {
  try {
    await Promise.all(
      req.body.cartData.map((data) => User.AddOder(req.body, data))
    );
    return res.status(200).json({
      message: "Successfully! orders added",
      statusCode: "200",
    });
  } catch (error) {
    console.error("Error adding orders:", error);
    return res.status(400).json({
      message: "Error adding orders",
      statusCode: "400",
    });
  }
};

const getDressitem = async function (req, res) {
  console.log("reach here");
  User.listDressitem()
    .then(async function (result) {
      return res.status(200).json(result);
    })
    .catch(function (error) {
      return res.status(400).json({
        message: error,
        statusCode: "400",
      });
    });
};
const listUser = async function (req, res) {
  User.getUsers()
    .then(async function (result) {
      return res.status(200).json(result);
    })
    .catch(function (error) {
      return res.status(400).json({
        message: error,
        statusCode: "400",
      });
    });
};
const LogOut = (req, res) => {
  User.isUserExists(req.body)
    .then((isExists) => {
      if (isExists) {
        return res.status(200).json({
          message: "LogOut successfully",
          statusCode: "200",
        });
      } else {
        return res.status(403).json({
          message: "Authorization Error",
          statusCode: "403",
        });
      }
    })
    .catch(function (error) {
      return res.status(403).json({
        message: "Authorization Error",
        statusCode: "403",
      });
    });
};

module.exports = {
  Login,
  listUser,
  Register,
  oderPlace,
  LogOut,
  getDressitem,
};
