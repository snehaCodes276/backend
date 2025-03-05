require('dotenv').config(); // Load environment variables
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// Initialize Express App
const app = express();
app.use(cors()); // Enable CORS for cross-origin requests
app.use(express.json()); // Parse JSON request bodies

// MongoDB Connection
const mongoURI = process.env.MONGO_URI || "mongodb+srv://eswarsai8074:GxlEfEfJ2Fw9g7nj@cluster0.fpvov.mongodb.net/test?retryWrites=true&w=majority";
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.error("MongoDB Connection Error:", err));

// Define Order Schema
const orderSchema = new mongoose.Schema({
    name: String,
    address: String,
    fuelType: String,
    litres: Number,
    status: { type: String, default: "Pending" }
});
const Order = mongoose.model("sneha_orders", orderSchema);

// API Endpoints for Orders
// POST: Add New Order (Customer)
app.post('/api/orders', async (req, res) => {
    try {
        const { name, address, fuelType, litres } = req.body;
        if (!name || !address || !fuelType || !litres) {
            return res.status(400).json({ error: "All fields are required" });
        }
        const newOrder = new Order({ name, address, fuelType, litres });
        await newOrder.save();
        res.status(201).json({ message: "Order Created Successfully", order: newOrder });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to create order" });
    }
});

// GET: Fetch All Orders (Owner)
app.get('/api/orders', async (req, res) => {
    try {
        const orders = await Order.find().sort({ _id: -1 }); // Sort by newest first
        res.status(200).json(orders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch orders" });
    }
});

// PUT: Update Order Status to "Delivered" (Owner)
app.put('/api/orders/:id/deliver', async (req, res) => {
    try {
        const orderId = req.params.id;
        const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            { status: "Delivered" },
            { new: true }
        );
        if (!updatedOrder) {
            return res.status(404).json({ error: "Order not found" });
        }
        res.status(200).json({ message: "Order Delivered Successfully", order: updatedOrder });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to update order status" });
    }
});

// Serve Static Files for Owner Dashboard under /server
app.use('/server', express.static(path.join(__dirname, 'public')));

// Redirect /server to /server/index.html
app.get('/server', (req, res) => {
    const indexPath = path.join(__dirname, 'public', 'index.html');
    if (!require('fs').existsSync(indexPath)) {
        return res.status(404).send("Dashboard not found. Please check your deployment.");
    }
    res.sendFile(indexPath);
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
