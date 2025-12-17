const express = require('express');
const cors = require('cors');
const { errorHandler } = require('./middlewares/error.middleware');
const villasRoutes = require('./routes/villas.routes');

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Versioned API routes
app.use('/v1/villas', villasRoutes);

// Centralized error handler (must be last)
app.use(errorHandler);

module.exports = app;


