const mongoose = require('mongoose');

const parkingRecordSchema = new mongoose.Schema({
  entryTime: {
    type: Date,
    required: true,
    default: Date.now
  },
  exitTime: {
    type: Date,
    default: null
  },
  duration: {
    type: Number, // Duration in minutes
    default: 0
  },
  car: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Car',
    required: true
  },
  parkingSlot: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ParkingSlot',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'completed'],
    default: 'active'
  },
  totalAmount: {
    type: Number,
    default: 0
  },
  isPaid: {
    type: Boolean,
    default: false
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Calculate duration when exitTime is set
parkingRecordSchema.pre('save', function(next) {
  if (this.exitTime && this.entryTime) {
    this.duration = Math.ceil((this.exitTime - this.entryTime) / (1000 * 60)); // Duration in minutes
    
    // Calculate total amount (1000 RWF per hour, minimum 1 hour)
    const hours = Math.ceil(this.duration / 60);
    this.totalAmount = Math.max(hours, 1) * 1000;
    
    if (this.status === 'active') {
      this.status = 'completed';
    }
  }
  next();
});

// Index for efficient queries
parkingRecordSchema.index({ entryTime: -1 });
parkingRecordSchema.index({ status: 1 });
parkingRecordSchema.index({ car: 1 });
parkingRecordSchema.index({ parkingSlot: 1 });

module.exports = mongoose.model('ParkingRecord', parkingRecordSchema);
