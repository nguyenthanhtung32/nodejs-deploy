const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const supplierSchema = new Schema(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      validate: {
        validator: function (value) {
          const emailRegex = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
          return emailRegex.test(value);
        },
        message: `{VALUE} is not a valid email!`,
      },
      required: [true, 'email is required'],
    },
    phoneNumber: {
      type: String,
      validate: {
        validator: function (value) {
          const phoneRegex = /^(0?)(3[2-9]|5[6|8|9]|7[0|6-9]|8[0-6|8|9]|9[0-4|6-9])[0-9]{7}$/;
          return phoneRegex.test(value);
        },
        message: `{VALUE} is not a valid phone!`,
      },
    },
    address: { type: String, required: true },
  },
  {
    versionKey: false,
    timestamps: true,
  },
);

const Supplier = model('Supplier', supplierSchema);
module.exports = Supplier;