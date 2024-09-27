const cron    = require('node-cron');
const Moment = require("moment");
const models  = require('../models');
const Discussion = models.Discussion
var task = cron.schedule('* * * * *', async() => {
	let check_date = Moment().format();
	let discussion = await Discussion.updateMany({end_date: { $lt: check_date }, status: 1}, {status: 0});
	//console.log('cron check past discussion', discussion)
});

task.start();


