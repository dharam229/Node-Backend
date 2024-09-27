const router          = require('express').Router();
const { API_V }       = process.env;
const auth            = require("../middleware/auth");
const user_validation = require('../validation-helper/user-validate');
const UserController  = require('../controllers').UserController;
const userController  = new UserController();
const multer          = require("multer");


router.post('/api/'+API_V+'/users/register', multer().any(),user_validation.checkEmailOrPhoneAlreadyExist, userController.register);
router.post('/api/'+API_V+'/users/verify-otp', multer().any(), userController.userVerifyOtp);
router.post('/api/'+API_V+'/users/resend-otp', multer().any(), userController.resendOtp);
router.post('/api/'+API_V+'/users/login', multer().any(), user_validation.login, userController.login);
router.post('/api/'+ API_V +'/users/create', multer().any(), auth, user_validation.register, userController.createUser);
router.post('/api/'+ API_V +'/users/update/:id', multer().any(), auth, user_validation.update, userController.updateUser);
router.post('/api/'+ API_V +'/users/save-cropped-image/:id', multer().any(), auth, userController.saveUserCroppedImage);
router.post('/api/'+ API_V +'/users/update-password/:id', multer().any(), auth, user_validation.UpadetPassword, userController.updatePassword);
router.get('/api/'+ API_V +'/users/form-add-edit-data/:id', auth, userController.formAddEditData);
router.get('/api/'+API_V+'/users/list-data',  multer().any(), auth, userController.listData);
router.get('/api/'+API_V+'/members/list-data',  multer().any(), auth, userController.listDataMembers);
router.get('/api/'+ API_V +'/members/block-unblock/:id', auth, userController.blockUnblockUser);
router.get('/api/'+API_V+'/users/check-token/:token',  userController.checkToken);
router.post('/api/'+API_V+'/users/forgot-password',  multer().any(), user_validation.ForgotPassword,userController.ForgotPassword);
router.post('/api/'+API_V+'/users/reset-password',  multer().any(), user_validation.ResetPassword,userController.ResetPassword);
router.get('/api/'+ API_V +'/users/view/:id', auth, userController.view);
router.get('/api/'+ API_V +'/users/delete/:id', auth, userController.delete);
router.get('/api/'+ API_V +'/users/log-out/:id', auth, userController.logout);
router.post('/api/'+API_V+'/users/verify-account',  multer().any(), userController.VerifyAccount);
router.get('/api/'+API_V+'/users/check-user-status', multer().any(), auth, userController.checkStatus);
router.get('/api/'+ API_V +'/users/update-status/:id', auth, userController.updateStatus);
router.post('/api/'+ API_V +'/users/change-password/:id', multer().any(), auth,userController.changePassword);
router.post('/api/'+ API_V +'/users/app-update-profile/:id', multer().any(), auth, user_validation.updateUserProfile, userController.updateUserProfile);
router.get('/api/'+ API_V +'/users/dashboard-data', multer().any(), auth, userController.getDashboardData);

//App Route
router.post('/api/'+API_V+'/users/app-login', multer().any(), userController.appLogin);
router.get('/api/'+ API_V +'/users/get-profile-data', auth, userController.getProfileData);
router.post('/api/'+ API_V +'/users/app-update-password', multer().any(), auth, userController.appUpdatePassword);

module.exports = router;