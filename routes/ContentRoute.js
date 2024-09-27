const router    = require('express').Router();
const auth      = require("../middleware/auth");
const { API_V } = process.env;
const content_validation = require('../validation-helper/content-validate');
const ContentController  = require('../controllers').ContentController;
const contentController  = new ContentController();
const multer = require("multer");

router.post('/api/'+ API_V +'/content/create', multer().any(), auth, content_validation.create, contentController.createContent);
router.post('/api/'+ API_V +'/content/update/:id', multer().any(), auth, content_validation.update, contentController.updateContent);
router.get('/api/'+ API_V +'/content/list-data', auth, contentController.listData);
router.get('/api/'+ API_V +'/content/form-add-edit-data/:id', auth, contentController.formAddEditData);
router.get('/api/'+ API_V +'/content/view/:id', auth, contentController.view);
router.get('/api/'+ API_V +'/content/update-status/:id', auth, contentController.updateStatus);
router.get('/api/'+ API_V +'/content/delete/:id', auth, contentController.delete);
//App route
router.get('/api/'+ API_V +'/content/page/:slug', contentController.getPage);

module.exports = router;