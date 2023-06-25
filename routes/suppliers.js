const yup = require('yup');
const express = require('express');
const router = express.Router();
const { Supplier } = require('../models');
const ObjectId = require('mongodb').ObjectId;
const {
  validateSchema,
  getSupplierSchema
} = require("../validation/suppliers");
const { getIdSchema } = require("../validation/getId");

// Methods: POST / PATCH / GET / DELETE / PUT
// Get all
router.get("/", validateSchema(getSupplierSchema), async (req, res, next) => {
  try {
    const { supplierName, limit, skip } = req.query;

    const conditionFind = {};

    if (supplierName) {
      conditionFind.name = new RegExp(`${supplierName}`);
    }

    let results = await Supplier.find(conditionFind).skip(skip).limit(limit).lean({ virtuals: true });

    const totalResults = await Supplier.countDocuments(conditionFind);

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

    let found = await Supplier.findById(id);

    if (found) {
      return res.send({ ok: true, result: found });
    }

    return res.send({ ok: false, message: "Object not found" });
  } catch (err) {
    res.status(401).json({
      statusCode: 401,
      message: "Unauthorized",
    });
  }
});

// Create new data
router.post("/", async function (req, res, next) {
  // Validate
  const validationSchema = yup.object({
    body: yup.object({
      name: yup.string().required(),
      email: yup.string().email().required(),
      phoneNumber: yup.string().required(),
      address: yup.string().required(),
    }),
  });

  validationSchema
    .validate({ body: req.body }, { abortEarly: false })
    .then(async () => {
      try {
        const data = req.body;
        const newItem = new Supplier(data);
        let result = await newItem.save();

        return res.send({ ok: true, message: "Created", result });
      } catch (err) {
        return res.status(500).json({ error: err });
      }
    })
    .catch((err) => {
      return res
        .status(400)
        .json({ type: err.name, errors: err.errors, provider: "yup" });
    });
});


// Delete data
router.delete("/:id", function (req, res, next) {
  const validationSchema = yup.object().shape({
    params: yup.object({
      id: yup.string().test("Validate ObjectID", "${path} is not valid ObjectID", (value) => {
        return ObjectId.isValid(value);
      }),
    }),
  });

  validationSchema
    .validate({ params: req.params }, { abortEarly: false })
    .then(async () => {
      try {
        const id = req.params.id;

        let found = await Supplier.findByIdAndDelete(id);

        if (found) {
          return res.send({ ok: true, result: found });
        }

        return res.status(410).send({ ok: false, message: "Object not found" });
      } catch (err) {
        return res.status(500).json({ error: err });
      }
    })
    .catch((err) => {
      return res
        .status(400)
        .json({
          type: err.name,
          errors: err.errors,
          message: err.message,
          provider: "yup",
        });
    });
});

router.patch("/:id", async function (req, res, next) {
  try {
    const id = req.params.id;
    const patchData = req.body;
    await Supplier.findByIdAndUpdate(id, patchData);

    res.send({ ok: true, message: "Updated" });
  } catch (error) {
    res.status(500).send({ ok: false, error });
  }
});
module.exports = router;