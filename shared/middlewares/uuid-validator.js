import { BadRequestError } from '#lib/errors.js';

export const validateUUIDParam = (paramName) => {
    return (req, res, next) => {
        const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
        const value = req.params[paramName];

        if (!value || !uuidRegex.test(value)) {
            return next(new BadRequestError(`Invalid format for ${paramName}. Expected a valid UUID.`));
        }

        next();
    };
};