const router                = require('express').Router();
const { API_V }             = process.env;
const auth                  = require("../middleware/auth");
const TicketController      = require('../controllers').TicketController;
const ticketController      = new TicketController();
const ticket_validation = require('../validation-helper/ticket-validate');
const multer                = require("multer");

router.post('/api/' + API_V + '/ticket/create', multer().any(), auth, ticket_validation.create, ticketController.create);
router.get('/api/'+API_V+'/ticket/list-data', auth, ticketController.listData);
router.post('/api/'+ API_V +'/ticket/update/:id', multer().any(), auth, ticket_validation.update, ticketController.update);
router.get('/api/'+ API_V +'/ticket/form-add-edit-data/:id', auth, ticketController.formAddEditData);
module.exports = router;