const router          = require('express').Router();
const { API_V }       = process.env;
const auth            = require("../middleware/auth");
const WebhookController  = require('../controllers').WebhookController;
const webhookController  = new WebhookController();
const multer          = require("multer");
var bodyParser = require('body-parser');


router.post('/api/'+ API_V +'/webhook/my-endpoint', bodyParser.raw({type: 'application/json'}), multer().any(),  webhookController.webhooksForSubscriptions);


module.exports = router;