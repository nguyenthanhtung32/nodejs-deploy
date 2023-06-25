const yup = require("yup");

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

const loginSchema = yup.object({
    body: yup.object({
        email: yup.string().email().required(),
        password: yup.string().min(3).max(31).required(),
    }),
    params: yup.object({}),
});

module.exports = {
    validateSchema,
    loginSchema,
};