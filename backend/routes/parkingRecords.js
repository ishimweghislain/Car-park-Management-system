const express = require('express');
const mongoose = require('mongoose');
const ParkingRecord = require('../models/ParkingRecord');
const Car = require('../models/Car');
const ParkingSlot = require('../models/ParkingSlot');
const Payment = require('../models/Payment');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/parking-records
// @desc    Get all parking records
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { status, page = 1, limit = 20, startDate, endDate } = req.query;

    const query = {};

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Filter by date range
    if (startDate || endDate) {
      query.entryTime = {};
      if (startDate) query.entryTime.$gte = new Date(startDate);
      if (endDate) query.entryTime.$lte = new Date(endDate);
    }

    const records = await ParkingRecord.find(query)
      .populate('car', 'plateNumber driverName phoneNumber')
      .populate('parkingSlot', 'slotNumber location')
      .sort({ entryTime: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await ParkingRecord.countDocuments(query);

    res.json({
      records,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get parking records error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/parking-records/stats/summary
// @desc    Get parking records statistics
// @access  Private
router.get('/stats/summary', auth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const stats = await ParkingRecord.aggregate([
      {
        $facet: {
          todayRecords: [
            { $match: { entryTime: { $gte: today, $lt: tomorrow } } },
            { $count: "count" }
          ],
          activeRecords: [
            { $match: { status: 'active' } },
            { $count: "count" }
          ],
          totalRevenue: [
            { $match: { status: 'completed', isPaid: true } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
          ],
          todayRevenue: [
            {
              $match: {
                status: 'completed',
                isPaid: true,
                exitTime: { $gte: today, $lt: tomorrow }
              }
            },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
          ]
        }
      }
    ]);

    const result = stats[0];

    res.json({
      todayRecords: result.todayRecords[0]?.count || 0,
      activeRecords: result.activeRecords[0]?.count || 0,
      totalRevenue: result.totalRevenue[0]?.total || 0,
      todayRevenue: result.todayRevenue[0]?.total || 0
    });
  } catch (error) {
    console.error('Get parking records stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/parking-records/:id
// @desc    Get parking record by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const record = await ParkingRecord.findById(req.params.id)
      .populate('car', 'plateNumber driverName phoneNumber carModel carColor')
      .populate('parkingSlot', 'slotNumber location');

    if (!record) {
      return res.status(404).json({ message: 'Parking record not found' });
    }

    res.json(record);
  } catch (error) {
    console.error('Get parking record error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/parking-records
// @desc    Create new parking record (car entry)
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { plateNumber, driverName, phoneNumber, slotNumber, carModel, carColor, notes } = req.body;

    // Validate input
    if (!plateNumber || !driverName || !phoneNumber || !slotNumber) {
      return res.status(400).json({
        message: 'Plate number, driver name, phone number, and slot number are required'
      });
    }

    // Find or create car
    let car = await Car.findOne({ plateNumber: plateNumber.toUpperCase() });
    if (!car) {
      car = new Car({
        plateNumber: plateNumber.toUpperCase(),
        driverName,
        phoneNumber,
        carModel,
        carColor
      });
      await car.save();
    } else {
      // Update car details if provided
      car.driverName = driverName;
      car.phoneNumber = phoneNumber;
      if (carModel) car.carModel = carModel;
      if (carColor) car.carColor = carColor;
      await car.save();
    }

    // Find parking slot
    const parkingSlot = await ParkingSlot.findOne({
      slotNumber,
      isActive: true
    });

    if (!parkingSlot) {
      return res.status(404).json({ message: 'Parking slot not found' });
    }

    if (parkingSlot.slotStatus !== 'available') {
      return res.status(400).json({ message: 'Parking slot is not available' });
    }

    // Check if car is already parked (has active record)
    const activeRecord = await ParkingRecord.findOne({
      car: car._id,
      status: 'active'
    });

    if (activeRecord) {
      return res.status(400).json({ message: 'Car is already parked' });
    }

    // Create parking record
    const parkingRecord = new ParkingRecord({
      car: car._id,
      parkingSlot: parkingSlot._id,
      entryTime: new Date(),
      notes
    });

    await parkingRecord.save();

    // Update slot status
    parkingSlot.slotStatus = 'occupied';
    await parkingSlot.save();

    // Populate and return the created record
    const populatedRecord = await ParkingRecord.findById(parkingRecord._id)
      .populate('car', 'plateNumber driverName phoneNumber carModel carColor')
      .populate('parkingSlot', 'slotNumber location');

    res.status(201).json(populatedRecord);
  } catch (error) {
    console.error('Create parking record error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/parking-records/:id/exit
// @desc    Process car exit
// @access  Private
router.put('/:id/exit', auth, async (req, res) => {
  try {
    const { exitTime, notes } = req.body;

    const record = await ParkingRecord.findById(req.params.id)
      .populate('parkingSlot');

    if (!record) {
      return res.status(404).json({ message: 'Parking record not found' });
    }

    if (record.status !== 'active') {
      return res.status(400).json({ message: 'Parking record is not active' });
    }

    // Set exit time
    record.exitTime = exitTime ? new Date(exitTime) : new Date();
    if (notes) record.notes = notes;

    await record.save();

    // Update slot status to available
    const parkingSlot = await ParkingSlot.findById(record.parkingSlot._id);
    parkingSlot.slotStatus = 'available';
    await parkingSlot.save();

    // Populate and return the updated record
    const populatedRecord = await ParkingRecord.findById(record._id)
      .populate('car', 'plateNumber driverName phoneNumber carModel carColor')
      .populate('parkingSlot', 'slotNumber location');

    res.json(populatedRecord);
  } catch (error) {
    console.error('Process car exit error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/parking-records/:id
// @desc    Update parking record
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const { entryTime, exitTime, notes } = req.body;

    const record = await ParkingRecord.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ message: 'Parking record not found' });
    }

    // Update fields
    if (entryTime) record.entryTime = new Date(entryTime);
    if (exitTime !== undefined) {
      record.exitTime = exitTime ? new Date(exitTime) : null;
    }
    if (notes !== undefined) record.notes = notes;

    await record.save();

    // Populate and return the updated record
    const populatedRecord = await ParkingRecord.findById(record._id)
      .populate('car', 'plateNumber driverName phoneNumber carModel carColor')
      .populate('parkingSlot', 'slotNumber location');

    res.json(populatedRecord);
  } catch (error) {
    console.error('Update parking record error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/parking-records/:id
// @desc    Delete parking record
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const record = await ParkingRecord.findById(req.params.id)
      .populate('parkingSlot');

    if (!record) {
      return res.status(404).json({ message: 'Parking record not found' });
    }

    // If record is active, free up the parking slot
    if (record.status === 'active') {
      const parkingSlot = await ParkingSlot.findById(record.parkingSlot._id);
      parkingSlot.slotStatus = 'available';
      await parkingSlot.save();
    }

    // Delete associated payments
    await Payment.deleteMany({ parkingRecord: record._id });

    // Delete the record
    await ParkingRecord.findByIdAndDelete(req.params.id);

    res.json({ message: 'Parking record deleted successfully' });
  } catch (error) {
    console.error('Delete parking record error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
