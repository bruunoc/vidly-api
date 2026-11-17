// Generic validation middleware.
// Receives a validation function and returns a middleware that uses it.
// Usage in a route: router.post('/', [auth, validate(validateReturn)], ...)
module.exports = (validator) => {
    return (req, res, next) => {
        const { error } = validator(req.body);
        if (error) return res.status(400).send(error.details[0].message);
        next();
    };
};
