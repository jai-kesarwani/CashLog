require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Import routes
const transactionRoutes = require('./routes/transactionRoutes');
const splitBillRoutes = require('./routes/splitBillRoutes');
const authRoutes = require('./routes/authRoutes');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/split-bills', splitBillRoutes);

app.get("/", (req, res) => {
    res.send("Cashlog Backend Running");
});

app.listen(process.env.PORT, () => {
    console.log(`Server running on http://localhost:${process.env.PORT}`);
});