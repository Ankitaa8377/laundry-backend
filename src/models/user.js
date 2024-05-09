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
async function getOneUserById(user_id) {
  console.log("getOneUser id==>", user_id);
  return new Promise(function (resolve, reject) {
    pool
      .query(`SELECT * FROM public.user WHERE id = $1`, [user_id])
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
  const is_delete = "0";
  const is_admin = 0;
  let mobile_no_data = parseInt(phone);
  return new Promise(function (resolve, reject) {
    hashPassword(password)
      .then(function (hash) {
        return pool.query(
          "INSERT INTO public.user(email, password, phone, is_delete ,is_admin) VALUES ($1,$2,$3,$4,$5)",
          [email, hash, mobile_no_data, is_delete, is_admin]
        );
      })
      .then(function (result) {
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
        console.log("error", err);
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
const getOrder = () => {
  return new Promise(function (resolve, reject) {
    pool
      .query(
        `SELECT ROW_NUMBER() OVER(ORDER BY order_id ) AS sr_no, * FROM public.order ORDER BY order_id ASC `,
        []
      )
      .then(function (results) {
        resolve(results.rows);
      })
      .catch(function (error) {
        console.log("error", error);
        reject(error);
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

const addOrder = function (request, user_data, response) {
  const { user_id, is_complete, address, toSelectTime, no_Of_days } = request;
  // Initialize variables to calculate grand total
  let totalPrice = 0;
  let totalQuantity = 0;

  // Iterate over each item in the cart
  request?.cartData.forEach((data) => {
    const { name, price, quantity, id } = data;

    // Calculate total price and quantity for each item
    totalPrice += price * quantity;
    totalQuantity += quantity;

    // Insert the order for the current item into the database
    pool
      .query(
        "INSERT INTO public.order(user_id, product_name, price, quantity, is_complete, dressitem_id, address, no_of_day, pick_up_time) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)",
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
      .then(() => {
        // Order inserted successfully
      })
      .catch((err) => {
        console.error("Error inserting order:", err);
      });
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

   <p><strong>Email:</strong> ${user_data.email}</p>
   <p><strong>Phone:</strong> ${user_data.phone}</p>
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
       ${request?.cartData
         .map(
           (data) => `
         <tr>
           <td>${data.name}</td>
           <td>${data.price}</td>
           <td>${data.quantity}</td>
           <td>${data.price * data.quantity}</td>
         </tr>
       `
         )
         .join("")}
     </tbody>
     <tfoot>
     <tr class="total-row">
     <td colspan="2">Delivery</td>
     <td>0</td>
     <td>25</td>
   </tr> 
     <tr class="total-row">
         <td colspan="2">Total</td>
         <td>${totalQuantity}</td>
         <td>${totalPrice + 25}</td>
       </tr>
     </tfoot>
   </table>
   <p><strong>Address:</strong> ${address}</p>
   <p><strong>No. of Days:</strong> ${no_Of_days}</p>
   <p><strong>Pick-up Time:</strong> ${toSelectTime}</p>
 </body>
</html>
`;

  // Configure nodemailer transporter
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "cleanwashlaundryapp@gmail.com", // Your email address
      pass: "wvtjyyeecgjyrcbr", // Your email password or app-specific password
    },
  });

  // Email options
  const mailOptions = {
    from: "cleanwashlaundryapp@gmail.com", // sender address
    to: user_data.email, // recipient email
    subject: "Invoice for your order", // Subject line
    html: invoiceHTML, // HTML body
  };

  // Send email
  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        reject(error);
      } else {
        console.log("Email sent: " + info.response);
        resolve();
      }
    });
  });
};

module.exports = {
  isUserExists,
  getOneUser,
  getUsers,
  AddUser,
  addOrder,
  listDressitem,
  getOneUserById,
  getOrder,
};
