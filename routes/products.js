const express = require("express");
const router = express.Router();
const Product = require("../models/product");

//Getting all
router.get("/products", async (req, res) => {
  try {
    let query = {};

    // Filtering by name
    if (req.query.name) {
      query.name = { $regex: new RegExp(req.query.name, "i") };
    }

    // Filtering by price
    if (req.query.price) {
      query.price = { $eq: req.query.price };
    }

    // Filtering by amount
    if (req.query.amount) {
      query.amount = { $eq: req.query.amount };
    }

    // Sorting
    let sortQuery = {};
    if (req.query.sortBy) {
      sortQuery[req.query.sortBy] = req.query.sortOrder === "desc" ? -1 : 1;
    }
    const products = await Product.find(query).sort(sortQuery);
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
router.get("/", (req, res) => {
  res.json({ message: "Welcome, go to endpoint /products to see project" });
});
//getting one
router.get("/products/:id", getProduct, (req, res) => {
  res.json(res.product);
});
//creating one
router.post("/products", async (req, res) => {
  try {
    const existingProduct = await Product.findOne({ name: req.body.name });

    if (existingProduct) {
      return res.status(400).json({ message: "Product name must be unique." });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
  const product = new Product({
    name: req.body.name,
    price: req.body.price,
    amount: req.body.amount,
    description: req.body.description,
  });
  try {
    const newProduct = await product.save();
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});
//updating one
router.put("/products/:id", getProduct, async (req, res) => {
  try {
    const existingProduct = await Product.findOne({ name: req.body.name });

    if (existingProduct) {
      return res.status(400).json({ message: "Product name must be unique." });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
  console.log(req.body.name);
  if (req.body.name != null) {
    res.product.name = req.body.name;
  }
  if (req.body.price != null) {
    res.product.price = req.body.price;
  }
  if (req.body.amount != null) {
    res.product.amount = req.body.amount;
  }
  if (req.body.description != null) {
    res.product.description = req.body.description;
  }
  try {
    const updated = await res.product.save();
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});
//deleting one
router.delete("/products/:id", getProduct, async (req, res) => {
  try {
    await res.product.deleteOne();
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
//report
router.get("/report", async (req, res) => {
  try {
    const report = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalQuantity: { $sum: "$amount" },
          totalValue: { $sum: { $multiply: ["$price", "$amount"] } },
          products: {
            $push: {
              name: "$name",
              quantity: "$amount",
              value: { $multiply: ["$price", "$amount"] },
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          totalQuantity: 1,
          totalValue: 1,
          products: 1,
        },
      },
    ]);

    res.json(report);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//not defined

router.all("*", (req, res) => {
  res.status(404).json({ message: "Endpoint not found" });
});
async function getProduct(req, res, next) {
  let product;
  try {
    product = await Product.findById(req.params.id);
    if (product == null) {
      console.log(res.product);
      return res.status(404).json({ message: "Cannot find" });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }

  res.product = product;
  next();
}
module.exports = router;
