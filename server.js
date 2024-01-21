require("dotenv").config();

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const PORT = 3000;

mongoose.connect(process.env.DATABASE_URL);
const db = mongoose.connection;
db.on("error", (error) => console.error(error));
db.once("open", () => console.log("Connected to DB"));
app.use(express.json());

app.use(express.json());

const productsRouter = require("./routes/products");
app.use("/", productsRouter);
app.use((err, req, res, next) => {
  console.error("** SERVER ERROR: " + err.message);
  res
    .status(500)
    .render("error", { message: "you shouldn't have clicked that!" });
});

app.use((req, res) => res.status(404).render("404"));

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
