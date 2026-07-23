const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true }, // snapshot at time of order
    thumbnail: { type: String, default: '' },
    price: { type: Number, required: true }, // unit price paid, after discount
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },

    items: [orderItemSchema],

    customerInfo: {
      fullName: String,
      email: String,
      phone: String,
      deliveryAddress: String,
      orderNotes: String,
    },

    subtotal: { type: Number, required: true },
    couponCode: { type: String, default: '' },
    discountAmount: { type: Number, default: 0 },
    shippingFee: { type: Number, default: 0 },
    total: { type: Number, required: true },

    paymentMethod: { type: String, enum: ['Cash on Delivery', 'M-Pesa', 'Card'], default: 'Cash on Delivery' },

    status: {
      type: String,
      enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Refunded'],
      default: 'Pending',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
