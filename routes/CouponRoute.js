const router    = require('express').Router();
const auth      = require("../middleware/auth");
const { API_V } = process.env;
const coupon_validation = require('../validation-helper/coupon-validate');
const CouponController  = require('../controllers').CouponController;
const couponController  = new CouponController();
const multer = require("multer");

router.post('/api/'+ API_V +'/coupons/create', multer().any(), auth, coupon_validation.create, couponController.create);
router.get('/api/'+ API_V +'/coupons/verify-coupon/:code', auth, couponController.verifyCoupon);
router.post('/api/'+ API_V +'/coupons/update/:id', multer().any(), auth, coupon_validation.update, couponController.update);
router.get('/api/'+ API_V +'/coupons/list-data', auth, couponController.listData);
router.get('/api/'+ API_V +'/coupons/form-add-edit-data/:id', auth, couponController.formAddEditData);
router.get('/api/'+ API_V +'/coupons/view/:id', auth, couponController.view);
router.get('/api/'+ API_V +'/coupons/update-status/:id', auth, couponController.updateStatus);
router.get('/api/'+ API_V +'/coupons/delete/:id', auth, couponController.delete);


module.exports = router;