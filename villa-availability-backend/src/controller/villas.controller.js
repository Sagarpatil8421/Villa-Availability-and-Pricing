const {
  validateAvailabilityQuery,
  validateQuoteParams,
} = require('../validators/villas.validator');
const {
  listAvailableVillas,
  getVillaQuote,
} = require('../services/villas.services');
const { AppError } = require('../middlewares/error.middleware');

async function getAvailableVillas(req, res, next) {
  try {
    const { error, value } = validateAvailabilityQuery(req.query);
    if (error) {
      // Normalize Joi messages to a clean, API-friendly string
      const details = error.details || [];
      const messages = details.map((d) => {
        let msg = d.message || 'Invalid value';
        // Remove superfluous quotes from Joi default messages
        msg = msg.replace(/"/g, '');
        // Make the date pattern error more readable
        msg = msg.replace(
          'fails to match the required pattern: /^\\d{4}-\\d{2}-\\d{2}$/',
          'must be in YYYY-MM-DD format',
        );
        return msg;
      });

      const message =
        messages.length > 0
          ? `Validation error: ${messages.join(', ')}`
          : 'Validation error: invalid query parameters';

      throw new AppError(400, message);
    }

    const result = await listAvailableVillas(value);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function getVillaQuoteController(req, res, next) {
  try {
    const villaId = Number(req.params.villa_id);
    if (!Number.isInteger(villaId) || villaId <= 0) {
      throw new AppError(400, 'villa_id must be a positive integer');
    }

    const { error, value } = validateQuoteParams(req.query);
    if (error) {
      // Normalize Joi messages similar to availability endpoint
      const details = error.details || [];
      const messages = details.map((d) => {
        let msg = d.message || 'Invalid value';
        msg = msg.replace(/"/g, '');
        msg = msg.replace(
          'fails to match the required pattern: /^\\d{4}-\\d{2}-\\d{2}$/',
          'must be in YYYY-MM-DD format',
        );
        return msg;
      });

      const message =
        messages.length > 0
          ? `Validation error: ${messages.join(', ')}`
          : 'Validation error: invalid query parameters';

      throw new AppError(400, message);
    }

    const result = await getVillaQuote(villaId, value);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAvailableVillas,
  getVillaQuoteController,
};


