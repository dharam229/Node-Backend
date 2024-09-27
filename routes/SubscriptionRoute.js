const router = require('express').Router();
const { API_V } = process.env;
const auth = require("../middleware/auth");
const SubscriptionController = require('../controllers').SubscriptionController;
const subscriptionController = new SubscriptionController();
const subscription_validation = require('../validation-helper/subscription-validate');
const multer = require("multer");

router.post('/api/' + API_V + '/subscription/create',multer().any(), auth,subscription_validation.create, subscriptionController.create);
router.post('/api/' + API_V + '/subscription/save-payment-status',multer().any(), subscriptionController.updatePaymentStatus);
router.get('/api/'+ API_V +'/subscription/list-data', auth, subscriptionController.listData);
router.get('/api/'+ API_V +'/subscription/currently-active', auth, subscriptionController.currentlyActiveSubscription);
router.post('/api/'+ API_V +'/subscription/update-payment-method', multer().any(), auth, subscriptionController.updatePaymentMethods);
router.post('/api/'+ API_V +'/subscription/cancel-or-resume', multer().any(), auth, subscriptionController.cancelOrResumeSubscription);
module.exports = router;