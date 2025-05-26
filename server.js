// server.js
const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const cookieParser = require('cookie-parser');
const categoryRoutes = require('./routes/categoryRoutes');
const seedAdmin = require('./config/adminSeeder');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Ensure your backend has proper CORS setup
app.use(cors({
    origin: ['http://localhost:5173', 'https://your-production-url.com'],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use('/auth', authRoutes);
app.use('/products', productRoutes);
app.use('/orders', orderRoutes);
app.use('/categories', categoryRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.get('/', (req, res) => res.send('API is running...'));

connectDB().then(() => {
    // seedAdmin();
    app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
});