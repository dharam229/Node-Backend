const router = require('express').Router();
const { API_V } = process.env;
const auth = require("../middleware/auth");
const NotificationController = require('../controllers').NotificationController;
const notificationController = new NotificationController();
const multer = require("multer");

router.post('/api/' + API_V + '/notification/create', multer().any(), auth, notificationController.createNotification);
router.get('/api/' + API_V + '/notification/list', multer().any(), auth, notificationController.listNotification);
router.get('/api/' + API_V + '/notification/count', multer().any(), auth, notificationController.countNotification);
router.get('/api/' + API_V + '/notification/delete', multer().any(), auth, notificationController.deleteNotification);

module.exports = router;