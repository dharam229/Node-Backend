const router                = require('express').Router();
const { API_V }             = process.env;
const auth                  = require("../middleware/auth");
const PlanController        = require('../controllers').PlanController;
const planController        = new PlanController();
const multer                = require("multer");

router.post('/api/' + API_V + '/plan/create', auth, planController.create);
router.get('/api/'+API_V+'/plan/list-data', auth, planController.listData);
router.get('/api/'+ API_V +'/plan/update-status/:id', auth, planController.updateStatus);

module.exports = router;