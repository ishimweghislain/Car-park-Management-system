const express = require('express');
const Car = require('../models/Car');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/cars
// @desc    Get all cars
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { search, page = 1, limit = 50 } = req.query;

    const query = { isActive: true };

    // Add search functionality
    if (search) {
      query.$or = [
        { plateNumber: { $regex: search, $options: 'i' } },
        { driverName: { $regex: search, $options: 'i' } },
        { phoneNumber: { $regex: search, $options: 'i' } }
      ];
    }

    const cars = await Car.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Car.countDocuments(query);

    res.json({
      cars,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get cars error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/cars/:id
// @desc    Get car by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);

    if (!car || !car.isActive) {
      return res.status(404).json({ message: 'Car not found' });
    }

    res.json(car);
  } catch (error) {
    console.error('Get car error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/cars/plate/:plateNumber
// @desc    Get car by plate number
// @access  Private
router.get('/plate/:plateNumber', auth, async (req, res) => {
  try {
    const car = await Car.findOne({
      plateNumber: req.params.plateNumber.toUpperCase(),
      isActive: true
    });

    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }

    res.json(car);
  } catch (error) {
    console.error('Get car by plate error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Note: Cars are created automatically through parking records
// No direct CREATE, UPDATE, or DELETE operations allowed on cars
// Cars are view-only and managed through the parking records system

module.exports = router;
