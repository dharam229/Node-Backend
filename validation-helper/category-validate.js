const validator = require('../validation-helper/validate');

const create = (req, res, next) => {
    const validationRule = {
        "name": "required|category_add:Category,name",
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
        "name": "required|category_update:Category,name,"+req.params.id,
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

module.exports = { 
  create, update
}