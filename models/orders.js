import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
  {
    // Shipping Information
    shippingName: {
      type: String,
      required: true,
    },
    shippingAddress: {
      type: String,
      required: true,
    },
    shippingEmail: {
      type: String,
    },
    shippingPhone: {
      type: String,
    },
    shippingCity: {
      type: String,
    },
    shippingPostalCode: {
      type: String,
    },
    shippingCountry: {
      type: String,
    },

    // Products
    products: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Card",
        },
        name: {
          type: String,
          required: true,
        },
        price: {
          type: Number,
        },
        quantity: {
          type: Number,
          required: true,
        },
        image: {
          type: String,
        },
      },
    ],

    // Order Details
    totalPrice: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ['COD', 'Card', 'JazzCash', 'EasyPaisa'],
      default: 'COD',
    },
    orderStatus: {
      type: String,
      enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Order Successful', 'Cancelled'],
      default: 'Pending',
    },
  },
  { timestamps: true }
);

export default mongoose.models.Order ||
mongoose.model("Order", OrderSchema);