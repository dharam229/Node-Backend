const validator = require('./validate');

const create = (req, res, next) => {
    const validationRule = {
        "priceId": "required|string",
       // "customerId": "required|string",
    }
    validator(req.body, validationRule, {}, (err, status) => {
        if (!status) {
            res.status(200)
                .send({
                    type: 'validation_error',
                    message: 'You form data is invalid',
                    data: err
                });
        } else {
            next();
        }
    });
}

module.exports = { create }