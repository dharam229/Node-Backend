const validator = require('../validation-helper/validate');
const create = (req, res, next) => {
    const validationRule = {
        "title": "required",
        //"description": "required",
        //"hash_tag": "required",
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

const update = (req, res, next) => {
    const validationRule = {
        "title": "required",
        //"description": "required",
        //"hash_tag": "required",
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

module.exports = { create,update }