const yup = require("yup");
const express = require("express");
const router = express.Router();
const { Category } = require("../models");
const ObjectId = require("mongodb").ObjectId;
const {
  validateSchema,
  getCategorySchema,
} = require("../validation/categories");
const { getIdSchema } = require("../validation/getId");

// Methods: POST / PATCH / GET / DELETE / PUT
// Get all
router.get("/", validateSchema(getCategorySchema), async (req, res, next) => {
  try {
    const { categoryName, limit, skip } = req.query;

    const conditionFind = {};

    if (categoryName) {
      conditionFind.name = new RegExp(`${categoryName}`);
    }

    let results = await Category.find(conditionFind).skip(skip).limit(limit).lean({ virtuals: true });

    const totalResults = await Category.countDocuments(conditionFind);

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

    let results = await Category.findById(id).lean({ virtuals: true });

    if (results) {
      return res.send({ ok: true, result: results });
    }

    return res.send({ ok: false, message: "Object not found" });
  } catch (err) {
    return res.status(400).json({ type: err.name, errors: err.errors, message: err.message, provider: 'yup' });
  }
});


// Create new data
router.post("/", async function (req, res, next) {
  // Validate
  const validationSchema = yup.object({
    body: yup.object({
      name: yup.string().required(),
      description: yup.string(),
      img: yup.string(),
    }),
  });

  validationSchema
    .validate({ body: req.body }, { abortEarly: false })
    .then(async () => {
      try {
        const data = req.body;
        const newItem = new Category(data);
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

        let found = await Category.findByIdAndDelete(id);

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
    await Category.findByIdAndUpdate(id, patchData);

    res.send({ ok: true, message: "Updated" });
  } catch (error) {
    res.status(500).send({ ok: false, error });
  }
});

module.exports = router;