const mongoose = require('mongoose');
const User = require('../models/User');
const ParkingSlot = require('../models/ParkingSlot');
require('dotenv').config();

const initializeData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smartpark');
    console.log('Connected to MongoDB');

    // Create admin user if it doesn't exist
    const existingAdmin = await User.findOne({ username: 'admin' });
    if (!existingAdmin) {
      const adminUser = new User({
        username: 'admin',
        password: '123',
        role: 'admin'
      });
      await adminUser.save();
      console.log('Admin user created (username: admin, password: 123)');
    } else {
      console.log('Admin user already exists');
    }

    // Create sample parking slots if they don't exist
    const existingSlots = await ParkingSlot.countDocuments();
    if (existingSlots === 0) {
      const slots = [];
      
      // Create 50 parking slots
      for (let i = 1; i <= 50; i++) {
        slots.push({
          slotNumber: `A${i.toString().padStart(2, '0')}`,
          slotStatus: 'available',
          location: i <= 25 ? 'Ground Floor' : 'First Floor'
        });
      }

      await ParkingSlot.insertMany(slots);
      console.log('50 sample parking slots created');
    } else {
      console.log(`${existingSlots} parking slots already exist`);
    }

    console.log('Data initialization completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing data:', error);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  initializeData();
}

module.exports = initializeData;
