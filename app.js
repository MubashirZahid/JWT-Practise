const express = require("express");
const app = express();
const ProductRouter = require("./routes/Product");
const AuthRouter = require("./routes/Auth");

const dotenv = require("dotenv");
const databaseConnection = require("./database/database");

dotenv.config();

app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));

app.use("/products", ProductRouter);
app.use("/auth", AuthRouter);

app.use((req, res) => {
  return res.status(400).send({ message: "Invalid Request" });
});

databaseConnection(() => {
  app.listen(8000, () => {
    console.log("Server is running on port 8000");
  });
});
