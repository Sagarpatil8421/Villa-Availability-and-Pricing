const Joi = require('joi');
const { STRICT_FORMAT } = require('../utils/date.utils');

// Shared date fields with basic format validation.
// More complex rules (e.g. check_out > check_in) are enforced via .custom below.
const dateFields = {
  check_in: Joi.string()
    .required()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .messages({
      'string.empty': 'check_in is required',
      'string.pattern.base': `check_in must be in ${STRICT_FORMAT} format`,
    }),
  check_out: Joi.string()
    .required()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .messages({
      'string.empty': 'check_out is required',
      'string.pattern.base': `check_out must be in ${STRICT_FORMAT} format`,
    }),
};

const availabilityQuerySchema = Joi.object({
  ...dateFields,
  sort: Joi.string()
    .valid('avg_price_per_night')
    .optional()
    .messages({
      'any.only': 'sort must be avg_price_per_night',
    }),
  order: Joi.string()
    .valid('asc', 'desc')
    .optional()
    .messages({
      'any.only': 'order must be either asc or desc',
    }),
  page: Joi.number()
    .integer()
    .min(1)
    .optional()
    .messages({
      'number.base': 'page must be a number',
      'number.integer': 'page must be an integer',
      'number.min': 'page must be at least 1',
    }),
  limit: Joi.number()
    .integer()
    .min(1)
    .optional()
    .messages({
      'number.base': 'limit must be a number',
      'number.integer': 'limit must be an integer',
      'number.min': 'limit must be at least 1',
    }),
}).custom((value, helpers) => {
  const { check_in: checkIn, check_out: checkOut } = value;

  // Extra safety: ensure the strings form valid dates when parsed.
  const inDate = new Date(checkIn);
  const outDate = new Date(checkOut);

  if (Number.isNaN(inDate.getTime()) || Number.isNaN(outDate.getTime())) {
    return helpers.error('any.invalid', {
      message: `Dates must be in ${STRICT_FORMAT} format`,
    });
  }

  const diffMs = outDate.getTime() - inDate.getTime();
  const nights = diffMs / (1000 * 60 * 60 * 24);

  if (nights <= 0) {
    // Business rule: checkout date must be after check-in
    return helpers.error('any.invalid', {
      message: 'check_out must be after check_in',
    });
  }

  return value;
});

const quoteParamsSchema = Joi.object({
  ...dateFields,
}).custom((value, helpers) => {
  const { check_in: checkIn, check_out: checkOut } = value;

  // Same date-range rules as availability, but without pagination/sort fields.
  const inDate = new Date(checkIn);
  const outDate = new Date(checkOut);

  if (Number.isNaN(inDate.getTime()) || Number.isNaN(outDate.getTime())) {
    return helpers.error('any.invalid', {
      message: `Dates must be in ${STRICT_FORMAT} format`,
    });
  }

  const diffMs = outDate.getTime() - inDate.getTime();
  const nights = diffMs / (1000 * 60 * 60 * 24);

  if (nights <= 0) {
    return helpers.error('any.invalid', {
      message: 'check_out must be after check_in',
    });
  }

  return value;
});

function validateAvailabilityQuery(query) {
  return availabilityQuerySchema.validate(query, {
    abortEarly: false,
    stripUnknown: true,
  });
}

function validateQuoteParams(params) {
  return quoteParamsSchema.validate(params, {
    abortEarly: false,
    stripUnknown: true,
  });
}

module.exports = {
  validateAvailabilityQuery,
  validateQuoteParams,
};


