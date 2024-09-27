const router          = require('express').Router();
const { API_V }       = process.env;
const auth            = require("../middleware/auth");
const CountryController  = require('../controllers').CountryController;
const countryController  = new CountryController();
const multer          = require("multer");

router.get('/api/'+API_V+'/country/list',  multer().any(), auth, countryController.countryList);
router.get('/api/'+API_V+'/country/state',  multer().any(), auth, countryController.stateList);
router.get('/api/'+API_V+'/country/city',  multer().any(), auth, countryController.cityList);

module.exports = router;