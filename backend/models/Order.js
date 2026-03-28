const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product"
        },
        variantId: {
          type: String,
          default: ""
        },
        size: {
          type: String,
          default: ""
        },
        color: {
          type: String,
          default: ""
        },
        price: {
          type: Number,
          default: 0
        },
        image: {
          type: String,
          default: ""
        },
        name: {
          type: String,
          default: ""
        },
        quantity: Number
      }
    ],

    totalPrice: Number,

    paymentStatus: {
      type: String,
      default: "pending"
    },

    orderStatus: {
      type: String,
      default: "processing"
    },

    status: {
      type: String,
      enum: ["Pending", "Shipped", "Delivered", "Cancelled"],
      default: "Pending"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);