const express = require("express");
const router = express.Router();

const { validateSchema } = require("../helpers/utils");
const {
  getDetailSchema,
  removeSchema,
  createSchema,
  removeAllSchema,
} = require("../validation/carts");
const { getDetail, create, remove, removeAll } = require("./controller");

router.route("/").post(validateSchema(createSchema), create);

router
  .route("/:customerId/:productId")
  .delete(validateSchema(removeSchema), remove);

router.route("/:id").get(validateSchema(getDetailSchema), getDetail);

router.route("/:customerId").delete(validateSchema(removeAllSchema), removeAll);

module.exports = router;