const router    = require('express').Router();
const auth      = require("../middleware/auth");
const { API_V } = process.env;
const ads_validation = require('../validation-helper/ads-validate');
const AdvertisementController  = require('../controllers').AdvertisementController;
const adsController  = new AdvertisementController();
const multer = require("multer");

//Web Route
router.get('/api/'+ API_V +'/advertisements/list-data', auth, adsController.listData);
//AppRoute
router.post('/api/'+ API_V +'/advertisements/create', multer().any(), auth, ads_validation.create, adsController.create);
router.post('/api/'+ API_V +'/advertisements/update/:id', multer().any(), auth, ads_validation.update, adsController.update);
router.get('/api/'+ API_V +'/advertisements/form-add-edit-data/:id', auth, adsController.formAddEditData);
router.get('/api/'+ API_V +'/advertisements/currency-list', auth, adsController.getCurrencyList);
router.get('/api/'+ API_V +'/advertisements/view/:id', auth, adsController.view);
router.get('/api/'+ API_V +'/advertisements/category/:id', auth, adsController.categoryAdvertisement);
router.get('/api/'+ API_V +'/advertisements/delete-file/:id', auth, adsController.deleteAdvertisementFiles);
router.get('/api/'+ API_V +'/advertisements/update-status/:id', auth, adsController.updateStatus);
router.get('/api/'+ API_V +'/advertisements/delete/:id', auth, adsController.delete);


module.exports = router;