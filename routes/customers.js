const passport = require("passport");
const express = require("express");

const { CONNECTION_STRING } = require("../constants/dbSettings");
const { default: mongoose } = require("mongoose");
const router = express.Router();
const { Customer } = require("../models");
const {
  validateSchema,
  getCustomerSchema,
} = require("../validation/customers");
const { loginSchema } = require("../validation/login");
const { getIdSchema } = require("../validation/getId");
const encodeToken = require("../helpers/jwtHelper");

// Methods: POST / PATCH / GET / DELETE / PUT

router.post(
  "/login",
  validateSchema(loginSchema),
  async (req, res, next) => {
    try {
      const { email } = req.body;

      const customer = await Customer.findOne({ email });

      if (!customer) return res.status(404).send({ message: "Not found" });

      const { _id, email: empEmail, firstName, lastName } = customer;

      const token = encodeToken(_id, empEmail, firstName, lastName);

      res.status(200).json({
        token,
        payload: customer,
      });
    } catch (err) {
      res.status(401).json({
        statusCode: 401,
        message: "Unauthorized",
      });
    }
  }
);

router.get(
  "/profile",
  passport.authenticate("jwt", { session: false }),
  async (req, res, next) => {
    try {
      console.log("<<<<<< req.user >>>>>>", req.user);
      const customer = await Customer.findById(req.user._id);

      if (!customer) return res.status(404).send({ message: "Not found" });

      res.status(200).json(customer);
    } catch (err) {
      res.sendStatus(500);
    }
  }
);
// Get all
router.get("/", validateSchema(getCustomerSchema), async (req, res, next) => {
  try {
    const { firstNameCustomer, lastNameCustomer, skip, limit } = req.query;

    const conditionFind = {};

    if (firstNameCustomer) {
      conditionFind.firstName = new RegExp(`${firstNameCustomer}`);
    }
    if (lastNameCustomer) {
      conditionFind.lastName = new RegExp(`${lastNameCustomer}`);
    }

    let results = await Customer.find(conditionFind)
      .skip(skip)
      .limit(limit)
      .lean({ virtuals: true });

    const totalResults = await Customer.countDocuments(conditionFind);
    res.json({
      payload: results,
      total: totalResults,
    });
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ ok: false, error });
  }
});

router.get("/:id", validateSchema(getIdSchema), async (req, res, next) => {
  // Validate
  try {
    const { id } = req.params;

    let results = await Customer.findById(id).lean({ virtuals: true });

    if (results) {
      return res.send({ ok: true, result: results });
    }

    return res.send({ ok: false, message: "Object not found" });
  } catch (err) {
    return res.status(400).json({
      type: err.name,
      errors: err.errors,
      message: err.message,
      provider: "yup",
    });
  }
});

// Create new data
router.post("/", async function (req, res, next) {
  try {
    const data = req.body;

    const newItem = new Customer(data);
    newItem
      .save()
      .then((result) => {
        res.send(result);
      })
      .catch((err) => {
        console.log(err);
        res.status(400).send({ message: err.message });
      });
  } catch (err) {
    res.sendStatus(500);
  }
});

// Delete data
router.delete("/:id", function (req, res, next) {
  try {
    const { id } = req.params;
    Customer.findByIdAndDelete(id)
      .then((result) => {
        res.send(result);
      })
      .catch((err) => {
        res.status(400).send({ message: err.message });
      });
  } catch (err) {
    res.sendStatus(500);
  }
});

router.patch("/:id", async function (req, res, next) {
  try {
    const id = req.params.id;
    const patchData = req.body;
    await Customer.findByIdAndUpdate(id, patchData);

    res.send({ ok: true, message: "Updated" });
  } catch (error) {
    res.status(500).send({ ok: false, error });
  }
});

module.exports = router;