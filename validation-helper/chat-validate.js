const validator = require('./validate');

const createChat = (req, res, next) => {
    const validationRule =  {
        "chat_type": "required",
    }
    req.body.chat_type == 2 ? validationRule.name = "required" : null  
    validator(req.body, validationRule, {}, (err, status) => {
        if (!status) {
            res.status(200).send({ type: 'validation_error', message: 'You form data is invalid', data: err });
        } else {
            next();
        }
    });
}



const updateChat = (req, res, next) => {
    const validationRule =  {
        //"users": "required",
        "chat_type": "required",
    }
    req.body.chat_type == 2 ? validationRule.name = "required" : null  
    validator(req.body, validationRule, {}, (err, status) => {
        if (!status) {
            res.status(200).send({type: 'validation_error', message: 'You form data is invalid', data: err });
        } else {
            next();
        }
    });
}

const startChat = (req, res, next) => {
    const validationRule =  {
        "message": "required",
        "sender": "required",
    }
    req.body.chat_type == 2 ? validationRule.name = "required" : null  
    validator(req.body, validationRule, {}, (err, status) => {
        if (!status) {
            res.status(200).send({type: 'validation_error', message: 'You form data is invalid', data: err });
        } else {
            next();
        }
    });
}

module.exports = { createChat, updateChat, startChat }