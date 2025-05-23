const mongoose = require('mongoose');

const parkingSlotSchema = new mongoose.Schema({
  slotNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  slotStatus: {
    type: String,
    enum: ['available', 'occupied', 'maintenance'],
    default: 'available'
  },
  location: {
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
parkingSlotSchema.index({ slotStatus: 1 });
parkingSlotSchema.index({ slotNumber: 1 });

module.exports = mongoose.model('ParkingSlot', parkingSlotSchema);
