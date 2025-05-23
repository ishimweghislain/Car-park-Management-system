const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  amountPaid: {
    type: Number,
    required: true,
    min: 0
  },
  paymentDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  parkingRecord: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ParkingRecord',
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'mobile_money', 'card'],
    default: 'cash'
  },
  transactionId: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'completed'
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
paymentSchema.index({ paymentDate: -1 });
paymentSchema.index({ parkingRecord: 1 });
paymentSchema.index({ status: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
