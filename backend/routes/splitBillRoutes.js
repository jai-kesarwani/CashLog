const express = require('express');
const router = express.Router();
const {
  createSplitBill,
  getSplitBills,
  getSplitBillById,
  updateSplitBill,
  deleteSplitBill,
  markAsPaid,
  settleSplitBill
} = require('../controllers/splitBillController');

// POST /split-bills - Create a new split bill
router.post('/', createSplitBill);

// GET /split-bills - Get all split bills
router.get('/', getSplitBills);

// GET /split-bills/:id - Get a single split bill by ID
router.get('/:id', getSplitBillById);

// PUT /split-bills/:id - Update a split bill
router.put('/:id', updateSplitBill);

// DELETE /split-bills/:id - Delete a split bill
router.delete('/:id', deleteSplitBill);

// PUT /split-bills/:id/mark-paid - Mark participant as paid
router.put('/:id/mark-paid', markAsPaid);

// PUT /split-bills/:id/settle - Settle a split bill
router.put('/:id/settle', settleSplitBill);

module.exports = router;
