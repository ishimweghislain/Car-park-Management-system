const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
  plateNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  driverName: {
    type: String,
    required: true,
    trim: true
  },
  phoneNumber: {
    type: String,
    required: true,
    trim: true
  },
  carModel: {
    type: String,
    trim: true
  },
  carColor: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
carSchema.index({ plateNumber: 1 });
carSchema.index({ phoneNumber: 1 });

module.exports = mongoose.model('Car', carSchema);
