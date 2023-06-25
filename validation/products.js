const yup = require("yup");
const ObjectId = require("mongodb").ObjectId;

const validateSchema = (schema) => async (req, res, next) => {
  try {
    await schema.validate({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    return next();
  } catch (err) {
    return res.status(400).json({ type: err.name, message: err.message });
  }
};

const getProductSchema = yup.object({
  query: yup.object({
    category: yup
      .string()
      .test("Validate ObjectID", "${path} is not valid ObjectID", (value) => {
        if (!value) return true;
        return ObjectId.isValid(value);
      }),
    supplier: yup
      .string()
      .test("Validate ObjectID", "${path} is not valid ObjectID", (value) => {
        if (!value) return true;
        return ObjectId.isValid(value);
      }),
    productName: yup.string(),
    stockStart: yup
      .number()
      .min(0)
      .test(
        "stockRange",
        "Stock start must be less than or equal to stock end",
        function (value) {
          const { stockEnd } = this.parent;
          return !(value > stockEnd);
        }
      ),
    stockEnd: yup
      .number()
      .test(
        "stockRange",
        "Stock end must be greater than or equal to stock start",
        function (value) {
          const { stockStart } = this.parent;
          return !(value < stockStart);
        }
      ),
    priceStart: yup
      .number()
      .min(0)
      .test(
        "priceRange",
        "price start must be less than or equal to price end",
        function (value) {
          const { priceEnd } = this.parent;
          return !(value > priceEnd);
        }
      ),
    priceEnd: yup
      .number()
      .test(
        "priceRange",
        "price end must be greater than or equal to price start",
        function (value) {
          const { priceStart } = this.parent;
          return !(value < priceStart);
        }
      ),
    discountStart: yup
      .number()
      .min(0)
      .test(
        "discountRange",
        "discount start must be less than or equal to discount end",
        function (value) {
          const { discountEnd } = this.parent;
          return !(value > discountEnd);
        }
      ),
    discountEnd: yup
      .number()
      .max(75)
      .test(
        "discountRange",
        "discount end must be greater than or equal to discount start",
        function (value) {
          const { discountStart } = this.parent;
          return !(value < discountStart);
        }
      ),
    skip: yup.number(),
    limit: yup.number(),
    description: yup.string(),
  }),
});

module.exports = {
  validateSchema,
  getProductSchema,
};
