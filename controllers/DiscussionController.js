const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const moment = require("moment");
const models = require('../models');
const sendEmail = require("../utils/sendEmail");
const Discussion = models.Discussion;
const Answer = models.DiscussionAnswer;
const Feedback = models.DiscussionFeedback;
const helpers = require('../_helpers/common')
const Fs = require('fs');
const crypto = require("crypto");
const { AnswerOptions } = require('../configs/constant');
const AWS = require('aws-sdk');
const S3 = new AWS.S3({ accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID, secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY })

module.exports = class DiscussionController {

	/****Save New Discussion Data**************/
	async createDiscussion(req, res) {
		req.body.created_by = req.user.user_id;
		req.body.updated_by = req.user.user_id;
		let discussion = new Discussion(req.body)
		return discussion.save()
			.then(function (result, error) {
				if (result) {
					res.status(200).send({ type: 'success', message: "Discussion data added successfully", data: result })
				} else {
					res.status(200).send({ type: 'error', message: error.message })
				}
			})
			.catch(error => res.status(200).send({ type: 'error', message: error.message }));
	}

	/****Get Form Pre Add Edit data**************/
	async formAddEditData(req, res) {
		var data = req.params.id !== '0' ? await Discussion.findById(req.params.id).populate({ path: 'answer', populate: [{ path: 'created_by', model: 'User' }] }).exec() : {};
		return res.status(200).send({ type: 'success', message: "", data: data, answer_options: AnswerOptions })
	}

	/****Get Form Pre Add Edit data**************/
	async anserFormAddEditData(req, res) {
		var data = req.params.id !== '0' ? await Answer.findById(req.params.id).populate(['discussion_id', 'created_by']).exec() : {};
		return res.status(200).send({ type: 'success', message: "", data: data })
	}

	/****Update Discussion Data**************/
	async updateDiscussion(req, res) {
		var dataDiscussion = await Discussion.findById(req.params.id);
		if (req.user.role !== 1 && dataDiscussion.created_by.toString() !== req.user.user_id) {
			return res.status(200).send({ type: 'error', message: 'You are not authorized for this operation' })
		}
		req.body.updated_by = req.user.user_id;
		let data_update = await Discussion.findByIdAndUpdate(req.params.id, req.body, { new: true }).exec();
		if (data_update) {
			return res.status(200).send({ type: 'success', message: "Discussion data updated successfully", data: data_update })
		} else {
			res.status(200).send({ type: 'error', message: 'Some error occured please try again later' })
		}
	}
	
	async republishDiscussion(req, res){
		var copy = await Discussion.findById(req.params.id);
		let discussion = new Discussion({topic: copy.topic, status: 1, answer_type: copy.answer_type, end_date: copy.end_date, created_by: req.user.user_id, updated_by: req.user.user_id})
		return discussion.save()
			.then(function (result, error) {
				if (result) {
					res.status(200).send({ type: 'success', message: "Discussion republised successfully", new_id: result.id })
				} else {
					res.status(200).send({ type: 'error', message: error.message })
				}
			})
			.catch(error => res.status(200).send({ type: 'error', message: error.message }));
	}

	/****Update Discussion Answer Data**************/
	async updateDiscussionAnswer(req, res) {
		try {
			req.body.answer_text = req.body.text; req.body.updated_by = req.user.user_id;
			let answer_data = await Answer.findById(req.params.id);
			if (req.user.role !== 1 && answer_data.created_by.toString() !== req.user.user_id) {
				return res.status(200).send({ type: 'error', message: 'You are not authorized for this operation' })
			}
			let data_update = await Answer.findByIdAndUpdate(req.params.id, req.body, { new: true }).exec();
			if (data_update) {
				//upload and update file data
				if (req.files !== undefined && req.files.length > 0) {
					await new DiscussionController().uploadFile(req, res, data_update);
					if(answer_data.answer.path != null){
						var oldFileParams = { Bucket: answer_data.bucket_name, Key: answer_data.answer.path };
						await S3.deleteObject(oldFileParams).promise();
					}
				}
				return res.status(200).send({ type: 'success', message: "Discussion answer data updated successfully", data: data_update })
			} else {
				res.status(200).send({ type: 'error', message: 'Some error occured please try again later' })
			}
		} catch (error) {
			return res.status(200).send({ type: 'error', message: error.message })
		}
	}

	/****Delete Discussion Answer**************/
	async deleteDiscussionAnswer(req, res) {
		let answer_data = await Answer.findById(req.params.id);
		if (req.user.role !== 1 && answer_data.created_by.toString() !== req.user.user_id) {
			return res.status(200).send({ type: 'error', message: 'You are not authorized for this operation' })
		}
		return await Answer.deleteOne({ _id: req.params.id })
			.then(data => res.status(200).send({ type: 'success', message: "Selected Discussion answer deleted successfully" }))
			.catch(error => res.status(200).send({ type: 'error', message: error.message }));
	}

	/****Update Discussion Data**************/
	async saveDiscussionAnswer(req, res) {
		req.body.answer_text = req.body.text;
		req.body.status = 1;
		req.body.created_by = req.user.user_id;
		req.body.updated_by = req.user.user_id;
		req.body.bucket_name = process.env.AWS_S3_BUCKET_NAME;
		let answer = new Answer(req.body)
		return answer.save()
			.then(function (result, error) {
				if (result) {
					//upload and update file data
					if (req.files !== undefined && req.files.length > 0) {
						new DiscussionController().uploadFile(req, res, result);
					}
					res.status(200).send({ type: 'success', message: "Answer saved added successfully", data: result })
				} else {
					res.status(200).send({ type: 'error', message: error.message })
				}
			})
			.catch(error => res.status(200).send({ type: 'error', message: error.message }));
	}

	async reportAnswer(req, res) {
		let answer_data = await Answer.findById(req.body.answer_id);
		req.body.bucket_name = process.env.AWS_S3_BUCKET_NAME;
		if (answer_data.created_by.toString() === req.user.user_id) {
			return res.status(200).send({ type: 'error', message: 'You are not authorized for this operation' })
		}
		if (Number(req.body.type) === 3) {
			var saved = await Feedback.findOne({ answer_id: req.body.answer_id, created_by: req.user.user_id, type: Number(req.body.type) }).exec();
			if (saved && Number(req.body.type) === Number(saved.type)) {
				return res.status(200).send({ type: 'error', message: 'You have already reported this answer' })
			} else {
				req.body.type = Number(req.body.type);
				req.body.status = 1;
				req.body.created_by = req.user.user_id;
				req.body.updated_by = req.user.user_id;
				let feedback = new Feedback(req.body)
				return feedback.save()
					.then(function (result, error) {
						if (result) {
							Answer.findByIdAndUpdate(req.body.answer_id, { $inc: { reported_count: 1 }, last_reported_time: Date.now() }).exec();
							res.status(200).send({ type: 'success', message: "Answer reported successfully" })
						} else {
							res.status(200).send({ type: 'error', message: error.message })
						}
					})
					.catch(error => res.status(200).send({ type: 'error', message: error.message }));
			}
		}
	}

	async likeDislikeAnswer(req, res) {
		let answer_data = await Answer.findById(req.body.answer_id);
		req.body.bucket_name = process.AWS_S3_BUCKET_NAME;
		if (answer_data.created_by.toString() === req.user.user_id) {
			return res.status(200).send({ type: 'error', message: 'You are not authorized for this operation' })
		}
		if (Number(req.body.type) === 1 || Number(req.body.type) === 2) {
			var saved = await Feedback.findOne({ answer_id: req.body.answer_id, created_by: req.user.user_id }).exec();
			var type = Number(req.body.type) === 1 ? 'liked' : 'disliked';
			if (saved) {
				if (Number(req.body.type) === Number(saved.type)) {
					return res.status(200).send({ type: 'error', message: 'You have already ' + type + ' this answer' })
				} else if (Number(req.body.type) !== Number(saved.type)) {
					saved.type = Number(req.body.type);
					return saved.save()
						.then(function (result, error) {
							if (result) {
								res.status(200).send({ type: 'success', message: 'Answer ' + type + ' successfully' })
							} else {
								res.status(200).send({ type: 'error', message: error.message })
							}
						})
						.catch(error => res.status(200).send({ type: 'error', message: error.message }));
				}
			} else {
				req.body.status = 1;
				req.body.created_by = req.user.user_id;
				req.body.updated_by = req.user.user_id;
				let feedback = new Feedback(req.body)
				return feedback.save()
					.then(function (result, error) {
						if (result) {
							res.status(200).send({ type: 'success', message: 'Answer ' + type + ' successfully' })
						} else {
							res.status(200).send({ type: 'error', message: error.message })
						}
					})
					.catch(error => res.status(200).send({ type: 'error', message: error.message }));
			}
		}
	}

	/***************Upload Advertisement File************/
	async uploadFile(req, res, result) {
		var file = req.files[0];	const ext = file.mimetype.split("/")[1];
		const fileName = Date.now() + '.' + ext;
		let FOLDER_PATH = 'discussion/' + req.body.discussion_id;
		const PRODUCT_UPLOAD_PATH = FOLDER_PATH + '/' + fileName;
		let params = { Bucket: process.env.AWS_S3_BUCKET_NAME, Key: PRODUCT_UPLOAD_PATH, Body: file.buffer, ContentType: file.mimetype };
		let uploadPromise = await S3.upload(params).promise();
		result.answer = { name: fileName, path: uploadPromise.Key, mime: file.mimetype };
		result.save();
	}

	/****Get List Of all the Users**************/
	async listData(req, res) {
		var query = {};
		var condition_arr = [];
		req.query.search_string !== undefined && req.query.search_string !== '' ? condition_arr.push({ topic: new RegExp(req.query.search_string, 'i') }) : '';
		req.query.show_active !== undefined && Number(req.query.show_active) !== 0 ? condition_arr.push({ status: Number(req.query.show_active) }) : '';
		if (req.query.date_range !== undefined && req.query.date_range !== '') {
			var date_arr = req.query.date_range.split("/").map(item => item.trim());
			const start_date = moment(date_arr[0]).startOf('day').toDate();
			const end_date = moment(date_arr[1]).endOf('day').toDate();
			condition_arr.push({ created_at: { $gte: start_date, $lte: end_date } });
		}
		if (condition_arr.length === 1) {
			query = condition_arr[0]
		} else if (condition_arr.length > 1) {
			query = { $and: condition_arr }
		}

		//var options = { sort: { _id: -1 }, populate :{path: 'answer', populate:[{ path: 'created_by', model: 'User'}]}, page: Number(req.query.page), limit: Number(req.query.limit) };
		var options = { sort: { _id: -1 }, populate: ['created_by'], page: Number(req.query.page), limit: Number(req.query.limit) };

		return Discussion.paginate(query, options)
			.then(result => res.status(200).send({ type: 'success', message: "List of dicussion get successfully.", data: result, answer_options: AnswerOptions }))
			.catch(error => res.status(200).send({ type: 'error', message: error.message }));

	}
	//get app discussion
	async appListData(req, res) {
		var query = {};
		var condition_arr = [{ status: 1 }];
		req.query.search_string !== undefined && req.query.search_string !== '' ? condition_arr.push({ topic: new RegExp(req.query.search_string, 'i') }) : '';
		if (req.query.date_range !== undefined && req.query.date_range !== '') {
			var date_arr = req.query.date_range.split("/").map(item => item.trim());
			const start_date = moment(date_arr[0]).startOf('day').toDate();
			const end_date = moment(date_arr[1]).endOf('day').toDate();
			condition_arr.push({ created_at: { $gte: start_date, $lte: end_date } });
		}
		if (condition_arr.length === 1) {
			query = condition_arr[0]
		} else if (condition_arr.length > 1) {
			query = { $and: condition_arr }
		}

		//var options = { sort: { _id: -1 }, populate :{path: 'answer', populate:[{ path: 'created_by', model: 'User'}]}, page: Number(req.query.page), limit: Number(req.query.limit) };
		var options = { sort: { _id: -1 }, populate: ['created_by'], page: Number(req.query.page), limit: Number(req.query.limit) };

		return Discussion.paginate(query, options)
			.then(result => res.status(200).send({ type: 'success', message: "", data: result, answer_options: AnswerOptions }))
			.catch(error => res.status(200).send({ type: 'error', message: error.message }));

	}

	/****Get Discussion Answer List Of all the Users**************/
	async answerListData(req, res) {
		var options = { sort: { _id: -1 }, populate: ['created_by'], page: Number(req.query.page), limit: Number(req.query.limit) };
		return Answer.paginate({ discussion_id: req.query.discussion_id }, options)
			.then(result => res.status(200).send({ type: 'success', message: "", data: result }))
			.catch(error => res.status(200).send({ type: 'error', message: error.message }));

	}

	/****Update Single Discussion Status**************/
	async updateStatus(req, res) {
		//console.log(req.params.id);
		let data = await Discussion.findById(req.params.id);
		//first check its time is left or not
		if(data.status === 0){
			if(helpers.diffYMDHMS(data.end_date) === ''){
				return res.status(200).send({ type: 'error', message: 'Cannot activate discussion as end date is gone' });
			}
		}
		let new_status = data.status === 1 ? 0 : 1;
		return await Discussion.findOneAndUpdate({ _id: req.params.id }, { status: new_status }, { new: true })
			.then(result => res.status(200).send({ type: 'success', message: "Discussion status updated successfully." }))
			.catch(error => res.status(200).send({ type: 'error', message: error.message }));
	}

	/****Get Single Discussion Detail**************/
	async view(req, res) {
		//console.log(req.params.id);
		return await Discussion.findById(req.params.id)
			.then(result => res.status(200).send({ type: 'success', message: "Discussion data get successfully.", data: result }))
			.catch(error => res.status(200).send({ type: 'error', message: error.message }));

	}

	/****Delete Discussion**************/
	async delete(req, res) {
		var dataDiscussion = await Discussion.findById(req.params.id);
		if (req.user.role !== 1 || dataDiscussion.created_by.toString() !== req.user.user_id) {
			return res.status(200).send({ type: 'error', message: 'You are not authorized for this operation' })
		}
		return await Discussion.deleteOne({ _id: req.params.id })
			.then(data => res.status(200).send({ type: 'success', message: "Selected Discussion deleted successfully" }))
			.catch(error => res.status(200).send({ type: 'error', message: error.message }));
	}
}