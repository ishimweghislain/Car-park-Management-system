const express = require('express');
const mongoose = require('mongoose');
const Payment = require('../models/Payment');
const ParkingRecord = require('../models/ParkingRecord');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/payments
// @desc    Get all payments
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { status, method, page = 1, limit = 20, startDate, endDate } = req.query;

    const query = {};

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Filter by payment method
    if (method) {
      query.paymentMethod = method;
    }

    // Filter by date range
    if (startDate || endDate) {
      query.paymentDate = {};
      if (startDate) query.paymentDate.$gte = new Date(startDate);
      if (endDate) query.paymentDate.$lte = new Date(endDate);
    }

    const payments = await Payment.find(query)
      .populate({
        path: 'parkingRecord',
        populate: [
          { path: 'car', select: 'plateNumber driverName phoneNumber' },
          { path: 'parkingSlot', select: 'slotNumber location' }
        ]
      })
      .sort({ paymentDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Payment.countDocuments(query);

    res.json({
      payments,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/payments/:id
// @desc    Get payment by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate({
        path: 'parkingRecord',
        populate: [
          { path: 'car', select: 'plateNumber driverName phoneNumber carModel carColor' },
          { path: 'parkingSlot', select: 'slotNumber location' }
        ]
      });

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    res.json(payment);
  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/payments
// @desc    Create new payment
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { parkingRecordId, amountPaid, paymentMethod, transactionId, notes } = req.body;

    // Validate input
    if (!parkingRecordId || !amountPaid) {
      return res.status(400).json({
        message: 'Parking record ID and amount paid are required'
      });
    }

    // Find parking record
    const parkingRecord = await ParkingRecord.findById(parkingRecordId);
    if (!parkingRecord) {
      return res.status(404).json({ message: 'Parking record not found' });
    }

    if (parkingRecord.status !== 'completed') {
      return res.status(400).json({ message: 'Parking record must be completed before payment' });
    }

    if (parkingRecord.isPaid) {
      return res.status(400).json({ message: 'Parking record is already paid' });
    }

    // Create payment
    const payment = new Payment({
      amountPaid,
      parkingRecord: parkingRecordId,
      paymentMethod: paymentMethod || 'cash',
      transactionId,
      notes
    });

    await payment.save();

    // Update parking record as paid
    parkingRecord.isPaid = true;
    await parkingRecord.save();

    // Populate and return the created payment
    const populatedPayment = await Payment.findById(payment._id)
      .populate({
        path: 'parkingRecord',
        populate: [
          { path: 'car', select: 'plateNumber driverName phoneNumber' },
          { path: 'parkingSlot', select: 'slotNumber location' }
        ]
      });

    res.status(201).json(populatedPayment);
  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/payments/:id
// @desc    Update payment
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const { amountPaid, paymentMethod, transactionId, status, notes } = req.body;

    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Update fields
    if (amountPaid !== undefined) payment.amountPaid = amountPaid;
    if (paymentMethod) payment.paymentMethod = paymentMethod;
    if (transactionId !== undefined) payment.transactionId = transactionId;
    if (status) payment.status = status;
    if (notes !== undefined) payment.notes = notes;

    await payment.save();

    // Populate and return the updated payment
    const populatedPayment = await Payment.findById(payment._id)
      .populate({
        path: 'parkingRecord',
        populate: [
          { path: 'car', select: 'plateNumber driverName phoneNumber' },
          { path: 'parkingSlot', select: 'slotNumber location' }
        ]
      });

    res.json(populatedPayment);
  } catch (error) {
    console.error('Update payment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/payments/stats/summary
// @desc    Get payment statistics
// @access  Private
router.get('/stats/summary', auth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const stats = await Payment.aggregate([
      {
        $facet: {
          todayPayments: [
            { $match: { paymentDate: { $gte: today, $lt: tomorrow }, status: 'completed' } },
            { $group: { _id: null, count: { $sum: 1 }, total: { $sum: '$amountPaid' } } }
          ],
          totalPayments: [
            { $match: { status: 'completed' } },
            { $group: { _id: null, count: { $sum: 1 }, total: { $sum: '$amountPaid' } } }
          ],
          paymentMethods: [
            { $match: { status: 'completed' } },
            { $group: { _id: '$paymentMethod', count: { $sum: 1 }, total: { $sum: '$amountPaid' } } }
          ]
        }
      }
    ]);

    const result = stats[0];

    res.json({
      todayPayments: {
        count: result.todayPayments[0]?.count || 0,
        total: result.todayPayments[0]?.total || 0
      },
      totalPayments: {
        count: result.totalPayments[0]?.count || 0,
        total: result.totalPayments[0]?.total || 0
      },
      paymentMethods: result.paymentMethods || []
    });
  } catch (error) {
    console.error('Get payment stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
