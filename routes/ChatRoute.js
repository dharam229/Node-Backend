const router          = require('express').Router();
const { API_V }       = process.env;
const auth            = require("../middleware/auth");
const chat_validation = require('../validation-helper/chat-validate');
const ChatController  = require('../controllers').ChatController;
const chatController  = new ChatController();
const multer          = require("multer");

router.post('/api/'+ API_V +'/chat/create',multer().any(), auth, chat_validation.createChat, chatController.createChat);
router.post('/api/'+ API_V +'/chat/start/:id',multer().any(), auth, chat_validation.startChat, chatController.startChat);
router.post('/api/'+ API_V +'/chat/update/:id',multer().any(), auth, chat_validation.updateChat, chatController.updateChat);
router.get('/api/'+ API_V +'/chat/read/:id',multer().any(), auth, chatController.readChat);
router.get('/api/'+ API_V +'/chat/retrieve/:id',multer().any(), auth, chatController.retrieveChat);
router.get('/api/'+API_V+'/chat/list-data',  multer().any(), auth, chatController.chatListData);//get user for chat
router.get('/api/'+API_V+'/chat/delete/:id',  multer().any(), auth, chatController.deleteChat);//delete chat

module.exports = router;