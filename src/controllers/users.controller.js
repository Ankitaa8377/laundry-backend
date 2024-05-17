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
                role: user.is_admin,
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
        status: "failed",
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
            message: "Succesfully! user added",
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

// const oderPlace = async function (req, res) {
//   User.getOneUserById(req.body.user_id)
//     .then((user_data) => {
//       console.log("user_data", user_data);
//       User.AddOder(req.body, user_data)
//         .then((result) => {
//           return res.status(200).json({
//             message: "Successfully! orders added",
//             statusCode: "200",
//           });
//         })
//         .catch(function (error) {
//           return res.status(400).json({
//             message: error,
//             statusCode: "400",
//           });
//         });
//     })
//     .catch(function (error) {
//       return res.status(400).json({
//         message: error,
//         statusCode: "400",
//       });
//     });
// };

const orderPlace = async function (req, res) {
  try {
    const user_data = await User.getOneUserById(req.body.user_id);
    const result = await User.addOrder(req.body, user_data);
    return res.status(200).json({
      message: "Successfully! Order added",
      statusCode: 200,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
      statusCode: 400,
    });
  }
};

const getDressitem = async function (req, res) {
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
const getOrderList = async function (req, res) {
  try {
    const result = await User.getOrder();
    const data = result.map((e) => ({
      id: e.order_id,
      order_no: e.sr_no,
      product_name: e.product_name,
      price: e.price,
      quantity: e.quantity,
      is_complete: e.is_complete,
      dressitem_id: e.dressitem_id,
      address: e.address,
      no_of_day: e.no_of_day,
      pick_up_time: e.pick_up_time,
    }));
    return res.status(200).json(data);
  } catch (error) {
    return res.status(400).json({
      message: error.message,
      statusCode: "400",
    });
  }
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
  orderPlace,
  LogOut,
  getDressitem,
  getOrderList,
};
