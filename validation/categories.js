const yup = require('yup');
const ObjectId = require('mongodb').ObjectId;

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

const getCategorySchema = yup.object({
    query: yup.object({
        categoryName: yup.string(),
        skip: yup.number(),
        limit: yup.number(),
    })
});


module.exports = {
    validateSchema,
    getCategorySchema,
}