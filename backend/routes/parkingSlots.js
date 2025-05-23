const express = require('express');
const ParkingSlot = require('../models/ParkingSlot');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/parking-slots
// @desc    Get all parking slots
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;

    const query = { isActive: true };
    if (status) {
      query.slotStatus = status;
    }

    const slots = await ParkingSlot.find(query)
      .sort({ slotNumber: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await ParkingSlot.countDocuments(query);

    res.json({
      slots,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get parking slots error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/parking-slots/:id
// @desc    Get parking slot by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const slot = await ParkingSlot.findById(req.params.id);

    if (!slot || !slot.isActive) {
      return res.status(404).json({ message: 'Parking slot not found' });
    }

    res.json(slot);
  } catch (error) {
    console.error('Get parking slot error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Note: Parking slots are managed by admin only
// Regular users can only view parking slots
// CREATE, UPDATE, DELETE operations are restricted to admin users

// @route   POST /api/parking-slots
// @desc    Create new parking slot (Admin only)
// @access  Admin
router.post('/', adminAuth, async (req, res) => {
  try {
    const { slotNumber, location } = req.body;

    // Validate input
    if (!slotNumber) {
      return res.status(400).json({ message: 'Slot number is required' });
    }

    // Check if slot number already exists
    const existingSlot = await ParkingSlot.findOne({ slotNumber });
    if (existingSlot) {
      return res.status(400).json({ message: 'Slot number already exists' });
    }

    const slot = new ParkingSlot({
      slotNumber,
      location,
      slotStatus: 'available'
    });

    await slot.save();
    res.status(201).json(slot);
  } catch (error) {
    console.error('Create parking slot error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/parking-slots/:id
// @desc    Update parking slot
// @access  Admin
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const { slotNumber, slotStatus, location } = req.body;

    const slot = await ParkingSlot.findById(req.params.id);
    if (!slot || !slot.isActive) {
      return res.status(404).json({ message: 'Parking slot not found' });
    }

    // Check if new slot number already exists (if changing)
    if (slotNumber && slotNumber !== slot.slotNumber) {
      const existingSlot = await ParkingSlot.findOne({ slotNumber });
      if (existingSlot) {
        return res.status(400).json({ message: 'Slot number already exists' });
      }
    }

    // Update fields
    if (slotNumber) slot.slotNumber = slotNumber;
    if (slotStatus) slot.slotStatus = slotStatus;
    if (location !== undefined) slot.location = location;

    await slot.save();
    res.json(slot);
  } catch (error) {
    console.error('Update parking slot error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/parking-slots/:id
// @desc    Delete parking slot (soft delete)
// @access  Admin
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const slot = await ParkingSlot.findById(req.params.id);
    if (!slot || !slot.isActive) {
      return res.status(404).json({ message: 'Parking slot not found' });
    }

    slot.isActive = false;
    await slot.save();

    res.json({ message: 'Parking slot deleted successfully' });
  } catch (error) {
    console.error('Delete parking slot error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/parking-slots/stats/summary
// @desc    Get parking slots statistics
// @access  Private
router.get('/stats/summary', auth, async (req, res) => {
  try {
    const stats = await ParkingSlot.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$slotStatus',
          count: { $sum: 1 }
        }
      }
    ]);

    const summary = {
      total: 0,
      available: 0,
      occupied: 0,
      maintenance: 0
    };

    stats.forEach(stat => {
      summary[stat._id] = stat.count;
      summary.total += stat.count;
    });

    res.json(summary);
  } catch (error) {
    console.error('Get parking slots stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
