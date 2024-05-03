const pool = require("../../config");
var bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
async function isUserExists(email) {
  // try {
  //   const results = await pool.query("SELECT * FROM users WHERE email = $1", [
  //     email,
  //   ]);
  //   return results.rowCount > 0;
  // } catch (error) {
  //   console.error("Error in isUserExists:", error);
  //   throw error;
  // }
  return new Promise(function (resolve, reject) {
    pool
      .query(`SELECT * FROM public.user WHERE email = $1`, [email])
      .then(function (results) {
        resolve(results.rowCount > 0);
      })
      .catch(function (err) {
        reject(err);
      });
  });
}

async function getOneUser(email) {
  console.log("getOneUser==>", email);
  return new Promise(function (resolve, reject) {
    pool
      .query(`SELECT * FROM public.user WHERE email = $1`, [email])
      .then(function (results) {
        resolve(results.rows[0]);
      })
      .catch(function (err) {
        reject(err);
      });
  });
}

const AddUser = (request, response) => {
  const { email, password, phone } = request;
  console.log("request", request);
  const is_delete = "0";
  let mobile_no_data = parseInt(phone);
  return new Promise(function (resolve, reject) {
    hashPassword(password)
      .then(function (hash) {
        return pool.query(
          "INSERT INTO public.user(email, password, phone, is_delete) VALUES ($1,$2,$3,$4)",
          [email, hash, mobile_no_data, is_delete]
        );
      })
      .then(function (result) {
        console.log("result.rows", result.rows);
        resolve(result.rows);
      })
      .catch(function (err) {
        console.log("err", err);
        reject(err);
      });
  });
};

function hashPassword(password) {
  return new Promise(function (resolve, reject) {
    bcrypt.genSalt(10, function (err, salt) {
      if (err) {
        reject(err);
      } else {
        bcrypt.hash(password, salt, function (err, hash) {
          if (err) {
            reject(err);
          } else {
            resolve(hash);
          }
        });
      }
    });
  });
}

const listDressitem = () => {
  return new Promise(function (resolve, reject) {
    pool
      .query(`SELECT * FROM public.dressitem ORDER BY id ASC `, [])
      .then(function (results) {
        resolve(results.rows);
      })
      .catch(function (err) {
        reject(err);
      });
  });
};
const getUsers = () => {
  return new Promise(function (resolve, reject) {
    pool
      .query(`SELECT * FROM public.user ORDER BY id ASC `, [])
      .then(function (results) {
        resolve(results.rows);
      })
      .catch(function (err) {
        reject(err);
      });
  });
};

// const AddOder = function (request, cart_data, response) {
//   const { user_id, is_complete, address, toSelectTime, no_Of_days } = request;
//   const { name, price, quantity, id } = cart_data;
//   return new Promise(function (resolve, reject) {
//     pool
//       .query(
//         "INSERT INTO public.oder(user_id, product_name, price, quantity, is_complete, dressitem_id, address,no_of_day, pick_up_time) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)",
//         [
//           user_id,
//           name,
//           price,
//           quantity,
//           is_complete,
//           id,
//           address,
//           no_Of_days,
//           toSelectTime,
//         ]
//       )
//       .then(function (result) {
//         resolve(result.rows[0]);
//       })
//       .catch(function (err) {
//         console.log("err", err);
//         reject(err);
//       });
//   });
// };
const AddOder = function (request, cart_data, response) {
  const {
    user_id,
    is_complete,
    address,
    toSelectTime,
    no_Of_days,
    user_name,
    user_email,
    user_phone,
  } = request;
  const { name, price, quantity, id } = cart_data;

  // Assuming you have configured nodemailer with your email service provider
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "cleanwashlaundryapp@gmail.com", // Your email address
      pass: "wvtjyyeecgjyrcbr", // Your email password or app-specific password
    },
  });

  // HTML template for the invoice
  const invoiceHTML = `
  <html>
  <head>
    <style>
      table {
        width: 100%;
        border-collapse: collapse;
      }
      th, td {
        border: 1px solid black;
        padding: 8px;
        text-align: left;
      }
      th {
        background-color: #f2f2f2;
      }
      .total-row {
        font-weight: bold;
      }
    </style>
  </head>
  <body>
    <h2>Invoice</h2>
    <p><strong>User:</strong> ${user_name}</p>
    <p><strong>Email:</strong> ${user_email}</p>
    <p><strong>Phone:</strong> ${user_phone}</p>
    <table>
      <thead>
        <tr>
          <th>Product Name</th>
          <th>Price</th>
          <th>Quantity</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>${name}</td>
          <td>${price}</td>
          <td>${quantity}</td>
          <td>${price * quantity}</td>
        </tr>
        <!-- Add more rows for additional products if needed -->
        <!-- Make sure to calculate total for each row -->
      </tbody>
      <tfoot>
        <tr class="total-row">
          <td colspan="3">Total</td>
          <td>${price * quantity}</td>
        </tr>
      </tfoot>
    </table>
    <p><strong>Address:</strong> ${address}</p>
    <p><strong>No. of Days:</strong> ${no_Of_days}</p>
    <p><strong>Pick-up Time:</strong> ${toSelectTime}</p>
  </body>
</html>
  `;

  // Email options
  const mailOptions = {
    from: "sarvaiyasarthak.aimsinfosoft@gmail.com", // sender address
    to: "ankitaa8377@gmail.com", // list of receivers
    subject: "Invoice for your order", // Subject line
    html: invoiceHTML, // HTML body
  };

  // Sending email
  return new Promise(function (resolve, reject) {
    pool
      .query(
        "INSERT INTO public.oder(user_id, product_name, price, quantity, is_complete, dressitem_id, address, no_of_day, pick_up_time) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)",
        [
          user_id,
          name,
          price,
          quantity,
          is_complete,
          id,
          address,
          no_Of_days,
          toSelectTime,
        ]
      )
      .then(function (result) {
        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log(error);
            reject(error);
          } else {
            console.log("Email sent: " + info.response);
            resolve(result.rows[0]);
          }
        });
      })
      .catch(function (err) {
        console.log("err", err);
        reject(err);
      });
  });
};

module.exports = {
  isUserExists,
  getOneUser,
  getUsers,
  AddUser,
  AddOder,
  listDressitem,
};
