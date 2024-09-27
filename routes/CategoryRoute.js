const router    = require('express').Router();
const auth      = require("../middleware/auth");
const { API_V } = process.env;
const category_validation = require('../validation-helper/category-validate');
const CategoryController  = require('../controllers').CategoryController;
const categoryController  = new CategoryController();
const multer = require("multer");

router.post('/api/'+ API_V +'/categories/create', multer().any(), auth, category_validation.create, categoryController.createCategory);
router.post('/api/'+ API_V +'/categories/update/:id', multer().any(), auth, category_validation.update, categoryController.updateCategory);
router.get('/api/'+ API_V +'/categories/list-data', auth, categoryController.listData);
router.get('/api/'+ API_V +'/categories/all', auth, categoryController.allData);
router.get('/api/'+ API_V +'/categories/form-add-edit-data/:id', auth, categoryController.formAddEditData);
router.get('/api/'+ API_V +'/categories/view/:id', auth, categoryController.view);
router.get('/api/'+ API_V +'/categories/update-status/:id', auth, categoryController.updateStatus);
router.get('/api/'+ API_V +'/categories/delete/:id', auth, categoryController.delete);


module.exports = router;