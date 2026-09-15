const express = require('express');
const cors = require('cors');
const routes = require('./routes/index');

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());

// Main API Router
app.use('/api', routes);

// Centralized error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: { message: 'Internal Server Error' } });
});

module.exports = app;
