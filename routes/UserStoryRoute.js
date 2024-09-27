const router                = require('express').Router();
const { API_V }             = process.env;
const auth                  = require("../middleware/auth");
const UserStoryController   = require('../controllers').UserStoryController;
const userStoryController   = new UserStoryController();
const multer                = require("multer");
const story_validation      = require('../validation-helper/story-validate');

router.post('/api/' + API_V + '/story/create', multer().any(), auth, story_validation.create, userStoryController.create);
router.post('/api/'+ API_V +'/story/update/:id', multer().any(), auth, story_validation.update, userStoryController.updateStory);
router.get('/api/'+API_V+'/story/list-data', auth, userStoryController.listData);
router.get('/api/'+API_V+'/story/list-data-for-app', auth, userStoryController.listOfStoryForAppToLoggedInOrAll);
router.get('/api/'+ API_V +'/story/form-add-edit-data/:id', auth, userStoryController.formAddEditData);
router.get('/api/'+ API_V +'/story/delete-story-file/:id', auth, userStoryController.deleteFile);
router.get('/api/'+ API_V +'/story/delete/:id', auth, userStoryController.deleteStory);
module.exports = router;