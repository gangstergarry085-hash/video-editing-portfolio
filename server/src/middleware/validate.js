/**
 * Creates an Express middleware from a Joi schema.
 * Validates req.body against the schema, strips unknown fields.
 */
export function validate(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: false,
      allowUnknown: true,
    });

    if (error) {
      error.isJoi = true;
      return next(error);
    }

    req.body = value;
    next();
  };
}
