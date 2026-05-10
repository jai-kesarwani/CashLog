const Transaction = require('../models/Transaction');

// Create a new transaction
exports.createTransaction = async (req, res) => {
  try {
    const { userId, title, amount, category, type, date, categoryId, icon } = req.body;

    if (!title || !amount || !category || !type || !date) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide all required fields' 
      });
    }

    const transaction = new Transaction({
      userId: userId || null,
      title,
      amount,
      category,
      type,
      date,
      categoryId: categoryId || null,
      icon: icon || ''
    });

    await transaction.save();

    res.status(201).json({
      success: true,
      message: 'Transaction created successfully',
      data: transaction
    });
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating transaction',
      error: error.message
    });
  }
};

// Get all transactions
exports.getTransactions = async (req, res) => {
  try {
    const { userId } = req.query;
    
    const query = userId ? { userId } : {};
    const transactions = await Transaction.find(query).sort({ date: -1 });

    res.status(200).json({
      success: true,
      data: transactions
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching transactions',
      error: error.message
    });
  }
};

// Get a single transaction by ID
exports.getTransactionById = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    res.status(200).json({
      success: true,
      data: transaction
    });
  } catch (error) {
    console.error('Error fetching transaction:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching transaction',
      error: error.message
    });
  }
};

// Update a transaction
exports.updateTransaction = async (req, res) => {
  try {
    const { userId, title, amount, category, type, date, categoryId, icon } = req.body;

    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    const updateData = {};
    if (userId !== undefined) updateData.userId = userId;
    if (title !== undefined) updateData.title = title;
    if (amount !== undefined) updateData.amount = amount;
    if (category !== undefined) updateData.category = category;
    if (type !== undefined) updateData.type = type;
    if (date !== undefined) updateData.date = date;
    if (categoryId !== undefined) updateData.categoryId = categoryId;
    if (icon !== undefined) updateData.icon = icon;

    const updatedTransaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Transaction updated successfully',
      data: updatedTransaction
    });
  } catch (error) {
    console.error('Error updating transaction:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating transaction',
      error: error.message
    });
  }
};

// Delete a transaction
exports.deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    await Transaction.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Transaction deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting transaction',
      error: error.message
    });
  }
};

// Get financial summary for dashboard
exports.getFinancialSummary = async (req, res) => {
  try {
    const { userId } = req.query;
    const query = userId ? { userId } : {};

    const transactions = await Transaction.find(query);

    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach(transaction => {
      if (transaction.type === 'income') {
        totalIncome += transaction.amount;
      } else if (transaction.type === 'expense') {
        totalExpense += transaction.amount;
      }
    });

    const balance = totalIncome - totalExpense;

    res.status(200).json({
      success: true,
      data: {
        totalIncome,
        totalExpense,
        balance
      }
    });
  } catch (error) {
    console.error('Error fetching financial summary:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching financial summary',
      error: error.message
    });
  }
};
