const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const moment = require("moment");
const models = require('../models');
const sendEmail = require("../utils/sendEmail");
const Discussion = models.Discussion;
const Answer = models.DiscussionAnswer;
const Feedback = models.DiscussionFeedback;
const Fs = require('fs');
const crypto = require("crypto");
const { AnswerOptions } = require('../configs/constant');

module.exports = class ReportController {

	/****Get list Report Discussion Answers **************/
	async getNumberOfUserReportDiscussionAnswers(req, res) {
		var query = {};	var condition_arr = [{ reported_count: { $gt: 0 } }];
		if (condition_arr.length === 1) {
			query = condition_arr[0]
		} else if (condition_arr.length > 1) {
			query = { $and: condition_arr }
		}
		var options = { sort: { last_reported_time: -1 }, populate: ['discussion_id'], page: Number(req.query.page), limit: Number(req.query.limit) };
		return Answer.paginate(query, options)
			.then(result => res.status(200).send({ type: 'success', message: "", data: result }))
			.catch(error => res.status(200).send({ type: 'error', message: error.message }));

	}

	/****Get list users who reported Discussion Answers **************/
	async listOfUserReportDiscussionAnswers(req, res) {
		var options = { sort: { _id: -1 }, populate: ['created_by','answer_id','discussion_id'], page: Number(req.query.page), limit: Number(req.query.limit) };
		return Feedback.paginate({ answer_id: req.query.answer_id }, options)
			.then(result => res.status(200).send({ type: 'success', message: "", data: result }))
			.catch(error => res.status(200).send({ type: 'error', message: error.message }));
	}

}