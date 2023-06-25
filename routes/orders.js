const yup = require("yup");
const express = require("express");
const router = express.Router();
const { Order, Product } = require("../models/index");

const ObjectId = require("mongodb").ObjectId;

// Methods: POST / PATCH / GET / DELETE / PUT
// Get all
router.get("/", async (req, res, next) => {
  try {
    let results = await Order.find()
      .populate("customer")
      .populate("employee")
      .lean({ virtuals: true });

    res.json(results);
  } catch (error) {
    res.status(500).json({ ok: false, error });
  }
});

router.get("/:id", async function (req, res, next) {
  try {
    const { id } = req.params;

    let found = await Order.findOne({ customerId: id });

    let results = await Order.find({ customerId: id })
      .populate("orderDetails.product")
      .populate("customer")
      .populate("employee")
      .lean({ virtual: true });

    if (found) {
      return res.send({ code: 200, payload: { found, results } });
    }

    return res.status(410).send({ code: 404, message: "Không tìm thấy" });
  } catch (err) {
    res.status(404).json({
      message: "Get detail fail!!",
      payload: err,
    });
  }
});



router.get("/abc/:id", async function (req, res, next) {
  try {
    const { id } = req.params;

    let found = await Order.findOne({ _id: id });

    let results = await Order.find({ _id: id })
      .populate("orderDetails.product")
      .lean({ virtual: true });

    if (found) {
      return res.send({ code: 200, payload: { found, results } });
    }

    return res.status(410).send({ code: 404, message: "Không tìm thấy" });
  } catch (err) {
    res.status(404).json({
      message: "Get detail fail!!",
      payload: err,
    });
  }
});


router.post("/", async function (req, res, next) {
  try {
    const data = req.body;
    console.log("req.body", req.body);

    const newItem = new Order(data);
    const savedItem = await newItem.save();

    // Giảm số lượng tồn kho sau khi mua hàng thành công
    await updateProductStock(savedItem);

    res.send(savedItem);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

async function updateProductStock(order) {
  for (const orderDetail of order.orderDetails) {
    const productId = orderDetail.productId;
    const quantity = orderDetail.quantity;

    // Giảm số lượng tồn kho của sản phẩm
    await Product.updateOne({ _id: productId }, { $inc: { stock: -quantity } });
  }
}

router.delete("/:id", function (req, res, next) {
  const validationSchema = yup.object().shape({
    params: yup.object({
      id: yup
        .string()
        .test("Validate ObjectID", "${path} is not valid ObjectID", (value) => {
          return ObjectId.isValid(value);
        }),
    }),
  });

  validationSchema
    .validate({ params: req.params }, { abortEarly: false })
    .then(async () => {
      try {
        const id = req.params.id;

        let found = await Order.findByIdAndDelete(id);

        if (found) {
          return res.send({ ok: true, result: found });
        }

        return res.status(410).send({ ok: false, message: "Object not found" });
      } catch (err) {
        return res.status(500).json({ error: err });
      }
    })
    .catch((err) => {
      return res.status(400).json({
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
    await Order.findByIdAndUpdate(id, patchData);

    res.send({ ok: true, message: "Updated" });
  } catch (error) {
    res.status(500).send({ ok: false, error });
  }
});


module.exports = router;