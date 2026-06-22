const mongoose = require('mongoose');

const splitBillSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  billName: {
    type: String,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  participants: {
    type: [String],
    required: true
  },
  splitType: {
    type: String,
    enum: ['equal', 'unequal'],
    required: true
  },
  splitData: {
    type: Map,
    of: Number,
    default: {}
  },
  paymentStatus: {
    type: Map,
    of: String,
    default: {}
  },
  paidBy: {
    type: String,
    default: ''
  },
  settled: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('SplitBill', splitBillSchema);
