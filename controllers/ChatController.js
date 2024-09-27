const models = require('../models');
const ChatMember = models.Chat;
const User = models.User;
const ChatMessage = models.ChatMessage;
const AWS = require('aws-sdk');
const S3 = new AWS.S3({ accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID, secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY })

module.exports = class ChatController {

	/****Create a chat for send messages**************/
	async createChat(req, res) {
		req.body.created_by = req.user.user_id;
		req.body.updated_by = req.user.user_id;
		(req.body.users != undefined && req.body.users.length > 0) ? req.body.users.push(req.user.user_id) : req.body.users = req.user.user_id;
		let chatMember = new ChatMember(req.body)
		return chatMember.save()
			.then(function (result, error) {
				if (result) {
					let msg = req.body.chat_type == 1 ? 'Private' : 'Group';
					res.status(200).send({ type: 'success', message: msg + " chat has been created successfully.", data: result })
				} else {
					res.status(200).send({ type: 'error', message: error.message })
				}
			})
			.catch(error => res.status(200).send({ type: 'error', message: error.message }));
	}


	/************UPDATE Chat name and their member name as well ******************/
	async updateChat(req, res) {
		req.body.updated_by = req.user.user_id;
		let data_update = await ChatMember.findByIdAndUpdate(req.params.id, req.body, { new: true }).exec();
		if (data_update) {
			let msg = req.body.chat_type == 1 ? 'Private' : 'Group';
			res.status(200).send({ type: 'success', message: msg + " chat has been updated successfully", data: data_update })
		} else {
			return res.status(200).send({ type: 'error', message: 'Some error occured please try again later' })
		}
	}

	/***********START CHAT BETWEEN USER ****************/
	async startChat(req, res) {
		req.body.created_by = req.user.user_id;
		req.body.sender = req.user.user_id;
		req.body.updated_by = req.user.user_id;
		req.body.chat = req.params.id;
		let chatMessage = new ChatMessage(req.body)
		return chatMessage.save()
			.then(function (result, error) {
				if (result) {
					res.status(200).send({ type: 'success', message: "Message has been sent successfully.", data: result })
				} else {
					res.status(200).send({ type: 'error', message: error.message })
				}
			})
			.catch(error => res.status(200).send({ type: 'error', message: error.message }));
	}

	/****** READ CHAT BY LOGGED IN USER FROM APP SIDE *********/
	async readChat(req, res) {
		req.body.updated_by = req.user.user_id;
		let messageData = await ChatMessage.findById(req.params.id).exec();
		req.body.users_read_at = messageData.users_read_at;
		req.body.users_read_at.includes(req.user.user_id) ? null : req.body.users_read_at.push(req.user.user_id);
		let data_update = await ChatMessage.findByIdAndUpdate(req.params.id, req.body, { new: true }).exec();
		if (data_update) {
			res.status(200).send({ type: 'success', message: "Massage read by user successfully", data: data_update })
		} else {
			return res.status(200).send({ type: 'error', message: 'Some error occured please try again later' })
		}
	}

	/*** Retrieve Chat Regarding Chat Member Id */
	async retrieveChat(req, res) {
		let chat_data = await ChatMessage.find({ chat: req.params.id }).exec();
		if (chat_data) {
			res.status(200).send({ type: 'success', message: "Message list get successfully", data: chat_data })
		} else {
			return res.status(200).send({ type: 'error', message: 'Some error occured please try again later' })
		}
	}

	async deleteChat(req, res) {
		try {
			let chat = await ChatMember.findOne({ _id: req.params.id }).exec();
			//first remove file from AWS S3 Bucket
			await new ChatController().emptyS3Directory('chat/' + chat._id);
			//remove all message entry from moda
			await ChatMessage.deleteMany({ chat_id: req.params.id }).exec();
			return await ChatMember.findOneAndDelete({ _id: req.params.id })
				.then(async result => {	res.status(200).send({ type: 'success', message: "Chat deleted successfully" })		})
				.catch(err => {	res.status(200).send({ type: 'error', message: err.message })	})
		} catch (error) {
			return res.status(200).send({ type: 'error', message: error.message })
		}
	}

	async emptyS3Directory(prefix) {
		var bucketName = process.env.AWS_S3_BUCKET_NAME;
		const listParams = { Bucket: bucketName, Prefix: prefix };
		const listedObjects = await S3.listObjectsV2(listParams).promise();
		if (listedObjects.Contents.length === 0) return;

		const deleteParams = {
			Bucket: bucketName,
			Delete: { Objects: [] },
		};
		listedObjects.Contents.forEach((content) => {
			deleteParams.Delete.Objects.push({ Key: content.Key });
		});
		await S3.deleteObjects(deleteParams).promise();
		if (listedObjects.IsTruncated) await new UserStoryController().emptyS3Directory(prefix);
	}

	/****Get List Of all the Users**************/
	async chatListData(req, res) {
		var query = {};
		var queryChatMember = {};
		var condition_arr = [];
		condition_arr.push({ chat_type: 2 })
		req.query.search_string !== undefined && req.query.search_string !== '' ? condition_arr.push({ name: new RegExp(req.query.search_string, 'i') }) : '';
		if (condition_arr.length === 1) {
			queryChatMember = condition_arr[0]
		} else if (condition_arr.length > 1) {
			queryChatMember = { $and: condition_arr }
		}
		var options = { sort: { _id: -1 } };
		var groupData = await ChatMember.paginate(queryChatMember, options)

		return User.paginate(query, options)
			.then(result => res.status(200).send({ type: 'success', message: "User list get successfully.", data: result, groupData: groupData }))
			.catch(error => res.status(200).send({ type: 'error', message: error.message }));
	}
}