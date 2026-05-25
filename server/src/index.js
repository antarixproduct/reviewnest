const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/db');

const app = express();

connectDB();

app.use(helmet({ contentSecurityPolicy: false }));
app.set('trust proxy', 1);

app.use(cors({
  origin: process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

app.get('/health', (req, res) => {
  res.json({ status: 'ReviewNest API is running' });
});

app.get('/r/:token', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/review.html'));
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/customers', require('./routes/customers'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/feedback', require('./routes/feedback'));
app.use('/api/business', require('./routes/business'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`ReviewNest server running on port ${PORT}`);
});
