require("dotenv").config();
require("./configs/database").connect();
const BodyParser = require("body-parser");
const Express = require("express");
var cors = require('cors');
require('./cron/cron-jobs');
path = require('path');
const app = Express();
app.use(cors())
//app.options('*', cors())
/***for parsing application/json***/
app.use(BodyParser.json());
/*****for parsing application/xwww-*****/
app.use(BodyParser.urlencoded({ extended: true }));
// Setting the app router and static folder
app.use(Express.static(path.resolve('uploads')));
/***Email Assets start here */
app.use(Express.static(path.resolve('assets')));

// Logic goes here
module.exports = app;