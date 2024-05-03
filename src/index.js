console.log("hello start node server");

const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const port = process.env.port || 3200;
const path = require("path");
const indexRouter = require("./routes/index");
var cors = require("cors");
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(cors());
app.use("/", indexRouter);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.listen(port, () => {
  console.log(`App running on port ${port}.`);
});
