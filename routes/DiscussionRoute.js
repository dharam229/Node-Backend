const router          = require('express').Router();
const { API_V }       = process.env;
const auth            = require("../middleware/auth");
const discussion_validation = require('../validation-helper/discussion-validate');
const DiscussionController  = require('../controllers').DiscussionController;
const discussionController  = new DiscussionController();
const multer          = require("multer");


router.post('/api/'+ API_V +'/discussions/create', multer().any(), auth, discussion_validation.create, discussionController.createDiscussion);
router.post('/api/'+ API_V +'/discussions/update/:id', multer().any(), auth, discussion_validation.update, discussionController.updateDiscussion);
router.get('/api/'+ API_V +'/discussions/form-add-edit-data/:id', auth, discussionController.formAddEditData);
router.get('/api/'+API_V+'/discussions/list-data',  multer().any(), auth, discussionController.listData);
router.get('/api/'+ API_V +'/discussions/update-status/:id', auth, discussionController.updateStatus);
router.get('/api/'+ API_V +'/discussions/view/:id', auth, discussionController.view);
router.get('/api/'+ API_V +'/discussions/delete/:id', auth, discussionController.delete);
router.get('/api/'+ API_V +'/discussions/republish/:id', auth, discussionController.republishDiscussion);

//API Routes
router.get('/api/'+API_V+'/discussions/app-list-data',  multer().any(), auth, discussionController.appListData);
router.post('/api/'+API_V+'/discussions/add-answer',  multer().any(), auth, discussionController.saveDiscussionAnswer);
router.get('/api/'+ API_V +'/discussions/answer-form-add-edit-data/:id', auth, discussionController.anserFormAddEditData);
router.post('/api/'+API_V+'/discussions/update-answer/:id',  multer().any(), auth, discussionController.updateDiscussionAnswer);
router.get('/api/'+ API_V +'/discussions/delete-answer/:id', auth, discussionController.deleteDiscussionAnswer);
router.get('/api/'+API_V+'/discussions/get-answer',  multer().any(), auth, discussionController.answerListData);
router.post('/api/'+API_V+'/discussions/report-answer',  multer().any(), auth, discussionController.reportAnswer);
router.post('/api/'+API_V+'/discussions/like-dislike-answer',  multer().any(), auth, discussionController.likeDislikeAnswer);
module.exports = router;