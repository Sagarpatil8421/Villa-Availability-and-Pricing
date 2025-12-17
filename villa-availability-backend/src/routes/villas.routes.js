const express = require('express');
const {
  getAvailableVillas,
  getVillaQuoteController,
} = require('../controller/villas.controller');

const router = express.Router();

// API #1 — LIST AVAILABLE VILLAS
// GET /v1/villas/availability
router.get('/availability', getAvailableVillas);

// API #2 — VILLA QUOTE
// GET /v1/villas/:villa_id/quote
router.get('/:villa_id/quote', getVillaQuoteController);

module.exports = router;


