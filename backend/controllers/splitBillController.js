const SplitBill = require('../models/SplitBill');

// Create a new split bill
exports.createSplitBill = async (req, res) => {
  try {
    const { userId, billName, totalAmount, participants, splitType, splitData, paymentStatus, paidBy } = req.body;

    if (!billName || !totalAmount || !participants || !splitType) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide all required fields' 
      });
    }

    const splitBill = new SplitBill({
      userId: userId || null,
      billName,
      totalAmount,
      participants,
      splitType,
      splitData: splitData || {},
      paymentStatus: paymentStatus || {},
      paidBy: paidBy || '',
      settled: false
    });

    await splitBill.save();

    res.status(201).json({
      success: true,
      message: 'Split bill created successfully',
      data: splitBill
    });
  } catch (error) {
    console.error('Error creating split bill:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating split bill',
      error: error.message
    });
  }
};

// Get all split bills
exports.getSplitBills = async (req, res) => {
  try {
    const { userId } = req.query;
    
    const query = userId ? { userId } : {};
    const splitBills = await SplitBill.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: splitBills
    });
  } catch (error) {
    console.error('Error fetching split bills:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching split bills',
      error: error.message
    });
  }
};

// Get a single split bill by ID
exports.getSplitBillById = async (req, res) => {
  try {
    const splitBill = await SplitBill.findById(req.params.id);

    if (!splitBill) {
      return res.status(404).json({
        success: false,
        message: 'Split bill not found'
      });
    }

    res.status(200).json({
      success: true,
      data: splitBill
    });
  } catch (error) {
    console.error('Error fetching split bill:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching split bill',
      error: error.message
    });
  }
};

// Update a split bill
exports.updateSplitBill = async (req, res) => {
  try {
    const { billName, totalAmount, participants, splitType, splitData, paymentStatus, paidBy, settled } = req.body;

    const splitBill = await SplitBill.findById(req.params.id);

    if (!splitBill) {
      return res.status(404).json({
        success: false,
        message: 'Split bill not found'
      });
    }

    const updateData = {};
    if (billName !== undefined) updateData.billName = billName;
    if (totalAmount !== undefined) updateData.totalAmount = totalAmount;
    if (participants !== undefined) updateData.participants = participants;
    if (splitType !== undefined) updateData.splitType = splitType;
    if (splitData !== undefined) updateData.splitData = splitData;
    if (paymentStatus !== undefined) updateData.paymentStatus = paymentStatus;
    if (paidBy !== undefined) updateData.paidBy = paidBy;
    if (settled !== undefined) updateData.settled = settled;

    const updatedSplitBill = await SplitBill.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Split bill updated successfully',
      data: updatedSplitBill
    });
  } catch (error) {
    console.error('Error updating split bill:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating split bill',
      error: error.message
    });
  }
};

// Delete a split bill
exports.deleteSplitBill = async (req, res) => {
  try {
    const splitBill = await SplitBill.findById(req.params.id);

    if (!splitBill) {
      return res.status(404).json({
        success: false,
        message: 'Split bill not found'
      });
    }

    await SplitBill.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Split bill deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting split bill:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting split bill',
      error: error.message
    });
  }
};

// Mark participant as paid
exports.markAsPaid = async (req, res) => {
  try {
    const { participant } = req.body;
    const splitBill = await SplitBill.findById(req.params.id);

    if (!splitBill) {
      return res.status(404).json({
        success: false,
        message: 'Split bill not found'
      });
    }

    if (!participant) {
      return res.status(400).json({
        success: false,
        message: 'Please provide participant name'
      });
    }

    const paymentStatus = splitBill.paymentStatus || {};
    paymentStatus[participant] = 'paid';

    const updatedSplitBill = await SplitBill.findByIdAndUpdate(
      req.params.id,
      { paymentStatus },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Participant marked as paid',
      data: updatedSplitBill
    });
  } catch (error) {
    console.error('Error marking as paid:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking as paid',
      error: error.message
    });
  }
};

// Settle a split bill
exports.settleSplitBill = async (req, res) => {
  try {
    const splitBill = await SplitBill.findById(req.params.id);

    if (!splitBill) {
      return res.status(404).json({
        success: false,
        message: 'Split bill not found'
      });
    }

    // Mark all participants as paid when settling
    const paymentStatus = {};
    if (splitBill.participants && Array.isArray(splitBill.participants)) {
      splitBill.participants.forEach(participant => {
        paymentStatus[participant] = 'paid';
      });
    }

    const updatedSplitBill = await SplitBill.findByIdAndUpdate(
      req.params.id,
      { 
        settled: true,
        paymentStatus: paymentStatus
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Split bill settled successfully',
      data: updatedSplitBill
    });
  } catch (error) {
    console.error('Error settling split bill:', error);
    res.status(500).json({
      success: false,
      message: 'Error settling split bill',
      error: error.message
    });
  }
};
