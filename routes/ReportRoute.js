const router          = require('express').Router();
const { API_V }       = process.env;
const auth            = require("../middleware/auth");
//const discussion_validation = require('../validation-helper/discussion-validate');
const ReportController  = require('../controllers').ReportController;
const reportController  = new ReportController();
const multer          = require("multer");



router.get('/api/'+API_V+'/report-discussion-answers/list-data',  multer().any(), auth, reportController.getNumberOfUserReportDiscussionAnswers);
router.get('/api/'+API_V+'/report-answers-user/list-data',  multer().any(), auth, reportController.listOfUserReportDiscussionAnswers);
module.exports = router;