const express = require('express');
const router = express.Router();
const {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  getFinancialSummary
} = require('../controllers/transactionController');
const authMiddleware = require('../middleware/authMiddleware');

// All transaction routes require authentication
router.use(authMiddleware);

// POST /transactions - Create a new transaction
router.post('/', createTransaction);

// GET /transactions - Get all transactions
router.get('/', getTransactions);

// GET /transactions/summary - Get financial summary for dashboard
router.get('/summary', getFinancialSummary);

// GET /transactions/:id - Get a single transaction by ID
router.get('/:id', getTransactionById);

// PUT /transactions/:id - Update a transaction
router.put('/:id', updateTransaction);

// DELETE /transactions/:id - Delete a transaction
router.delete('/:id', deleteTransaction);

module.exports = router;
