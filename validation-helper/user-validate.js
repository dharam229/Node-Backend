const validator = require('../validation-helper/validate');
const models = require('../models');
const User = models.User;
const UserOtp = models.UserOtp;

const register = (req, res, next) => {
    const validationRule = {
        "firstname": "required|string",
        "lastname": "required|string",
        "email": "required|email|exist:User,email",
        "password": "required|string|min:8",
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


// Check for email and phone if already exist 
const checkEmailOrPhoneAlreadyExist = (req, res, next) => {
    if (req.body.phone !== undefined || req.body.email !== undefined) {
        var conditions = {};
        if (req.body.phone !== undefined && req.body.email !== undefined) {
            conditions = { $or: [{ 'phone': req.body.phone }, { 'email': req.body.email }] };
        } else if (req.body.email !== undefined) {
            conditions = { 'email': req.body.email };
        } else {
            conditions = { 'phone': req.body.phone };
        }
        User.findOne(conditions, async function (err, user) {
            if (err) return res.status(200).send({ type: 'error', message: err.message });
            if (user) {
                if (Number(user.status) === 0) {
                    var new_otp = Math.floor(10000 + Math.random() * 90000);
                    await UserOtp.findOneAndUpdate({ created_by: user._id }, { otp: new_otp }, { returnOriginal: false });
                    return res.status(200).send({ type: 'success', message: "Your one time password for verification", otp: new_otp })
                } else {
                    let msg = '';
                    if (req.body.email.toString() == user.email && req.body.phone.toString() == user.phone) {
                        msg = 'This email and phone number already exist in the system.';
                    } else if (req.body.phone.toString() == user.phone) {
                        msg = 'This phone number is already exist in the system.';
                    } else {
                        msg = 'This email already exist in the system.';
                    }
                    return res.status(200).send({ type: 'error', message: msg })
                }
            } else {
                next();
            }
        });
    } else {
        next();
    }
}



const appregister = (req, res, next) => {
    const validationRule = {
        "firstname": "required|string",
        "lastname": "required|string",
        "email": "required|email|exist:User,email",
        "phone": "required|phone|exist:User,phone",
        "password": "required|string|min:8|check_password|confirmed",
        "password_confirmation": "required|string|min:8|check_password",
        "agree_term": "required"
    }
    validator(req.body, validationRule, {}, (err, status) => {
        if (!status) {
            res.status(200)
                .send({
                    type: 'error',
                    message: 'You form data is invalid',
                    data: err
                });
        } else {
            next();
        }
    });
}


const login = (req, res, next) => {
    const validationRule = {
        "email": "required|email",
        "password": "required",
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
        "firstname": "required|string",
        "lastname": "required|string",
        "email": "required|email|exist_update:User,email," + req.params.id,
        //"password": "required|string|min:6|strict",
        "role": "required",
        "status": "required",
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

const updateUserProfile = (req, res, next) => {

    const validationRule = {
        "firstname": "required|string",
        "lastname": "required|string",
        "email": "required|email|exist_update:User,email," + req.params.id,
        "phone": "required",
        "gender": "required|integer",
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

const UpadetPassword = (req, res, next) => {
    const validationRule = {
        "password": "required|string|min:6|check_password",
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

const ForgotPassword = (req, res, next) => {
    const validationRule = {
        "email": "required|email",
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
const ResetPassword = (req, res, next) => {
    const validationRule = {
        "password": "required|string|min:6|confirmed|check_password",
        "password_confirmation": "required|string|min:6|check_password",
        "token": "required",
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
    register, appregister, update, UpadetPassword, ForgotPassword, ResetPassword, login, updateUserProfile, checkEmailOrPhoneAlreadyExist
}