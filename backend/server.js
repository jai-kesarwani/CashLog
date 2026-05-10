require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
.then(() => {
    console.log("MongoDB Connected");
})
.catch((err) => {
    console.log(err);
});

// Import routes
const transactionRoutes = require('./routes/transactionRoutes');
const splitBillRoutes = require('./routes/splitBillRoutes');

// Use routes
app.use('/api/transactions', transactionRoutes);
app.use('/api/split-bills', splitBillRoutes);

app.get("/", (req, res) => {
    res.send("Cashlog Backend Running");
});

app.listen(process.env.PORT, () => {
    console.log(`Server running on http://localhost:${process.env.PORT}`);
});