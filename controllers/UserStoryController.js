const models = require('../models');
const UserStory = models.UserStory;
const StoryFile = models.UserStoryFile;
const Fs = require('fs');
const path = require('path');
const AWS = require('aws-sdk');
const S3 = new AWS.S3({ accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID, secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY })

module.exports = class UserStoryController {

	/****Save New Stories Data**************/
	async create(req, res) {
		try {
			req.body.method = 'create';
			if (req.files === undefined || req.files.length === 0) {
				return res.status(400).send({ type: 'error', message: 'File field is required to create a story' })
			}
			if (typeof req.body.hash_tag === "string") {
				req.body.hash_tag = req.body.hash_tag.split(',');
			}
			req.body.user = req.user.user_id;
			req.body.created_by = req.user.user_id;
			req.body.updated_by = req.user.user_id;
			let userStory = new UserStory(req.body)
			return userStory.save()
				.then(function (result, error) {
					if (result) {
						//If have any file save them
						if (req.files !== undefined && req.files.length > 0) {
							new UserStoryController().uploadFile(req, res, result);
						}
						res.status(200).send({ type: 'success', message: "User story has been created successfully", data: result })
					} else {
						res.status(200).send({ type: 'error', message: error.message })
					}
				})
				.catch(error => res.status(200).send({ type: 'error', message: error.message }));
		} catch (error) {
			return res.status(200).send({ type: 'error', message: error.message })
		}
	}

	/****Update Story Data**************/
	async updateStory(req, res) {
		try {
			req.body.updated_by = req.user.user_id;
			if (typeof req.body.hash_tag === "string") {
				req.body.hash_tag = req.body.hash_tag.split(',');
			}
			let data_update = await UserStory.findByIdAndUpdate(req.params.id, req.body, { new: true }).exec();
			if (data_update) {
				if (req.files !== undefined && req.files.length > 0) {
					new UserStoryController().uploadFile(req, res, data_update);
				}
				return res.status(200).send({ type: 'success', message: "Story updated successfully" })
			} else {
				return res.status(200).send({ type: 'error', message: 'Some error occured please try again later' })
			}
		} catch (error) {
			return res.status(200).send({ type: 'error', message: error.message })
		}
	}

	/****Delete story file data**************/
	async deleteFile(req, res) {
		let file_data = await StoryFile.findById(req.params.id);
		var oldFileParams = { Bucket: file_data.bucket_name, Key: file_data.path };
		await S3.deleteObject(oldFileParams).promise();
		//Remove file refrence from user stroy table
		let story = await UserStory.findByIdAndUpdate(file_data.story_id, { $pull: { story_file: file_data._id } }, { new: true }).exec();
		//Delete story file from table
		await file_data.remove();
		return StoryFile.find({ story_id: story._id })
			.then(data => res.status(200).send({ type: 'success', message: "Selected file deleted successfully", files: data }))
			.catch(error => res.status(200).send({ type: 'error', message: error.message }));
	}

	/****Delete story and its file data**************/
	async deleteStory(req, res) {
		try {
			//first remove file from AWS S3 Bucket
			await new UserStoryController().emptyS3Directory('story/' + req.params.id);
			//remove all files belongs to the deleted stroy
			await StoryFile.deleteMany({ story_id: { $eq: req.params.id } });
			//delete story
			await UserStory.deleteOne({ _id: req.params.id });
			res.status(200).send({ type: 'success', message: "Story deleted successfully" })
		} catch (err) {
			return res.status(200).send({ type: 'error', message: 'Some error occured during deleting story' });
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

	/****Get Form Pre Add Edit data**************/
	async formAddEditData(req, res) {
		var data = req.params.id !== '0' ? await UserStory.findById(req.params.id).populate(['user', 'story_file']).exec() : {};
		return res.status(200).send({ type: 'success', message: "", data: data })
	}

	/****Get List Of Stories**************/
	async listData(req, res) {
		var query = {};
		var condition_arr = [{ user: req.user.user_id }];
		if (req.query.search_string !== undefined && req.query.search_string !== '') {
			condition_arr.push({ title: new RegExp(req.query.search_string, 'i') })
		}
		if (req.query.search_tag !== undefined && req.query.search_tag !== '') {
			var arrayOfTagSearch = req.query.search_tag.split(','); var arrayOfTagSearchCaseSenstive = [];
			arrayOfTagSearch.forEach(function (item) {
				arrayOfTagSearchCaseSenstive.push(item);
			})
			condition_arr.push({ hash_tag: { $in: new RegExp(arrayOfTagSearchCaseSenstive, 'i') } })
		}
		if (req.query.date_range !== undefined && req.query.date_range !== '') {
			var arrVars = req.query.date_range.split("/");
			if (arrVars.length === 2) {
				const start = new Date(arrVars[0]);
				start.setHours(0, 0, 0, 0);
				const end = new Date(arrVars[1]);
				end.setHours(23, 59, 59, 999);
				condition_arr.push({ created_at: { $gte: start, $lte: end } });
			}
		}
		if (condition_arr.length === 1) {
			query = condition_arr[0]
		} else if (condition_arr.length > 1) {
			query = { $and: condition_arr }
		}
		console.log(query)
		var options = { sort: { _id: -1 }, populate: ['user', 'story_file'], page: Number(req.query.page), limit: Number(req.query.limit) };
		return UserStory.paginate(query, options)
			.then(result => res.status(200).send({ type: 'success', message: "List of stories get successfully.", data: result }))
			.catch(error => res.status(200).send({ type: 'error', message: error.message }));
	}


	/****Get List Of Stories of his or all stories for app **************/
	async listOfStoryForAppToLoggedInOrAll(req, res) {
		var query = {};
		var condition_arr = [];
		if (Number(req.query.story_type) === 1) {
			condition_arr.push({ user: req.user.user_id })
		}
		if (req.query.search_string !== undefined && req.query.search_string !== '') {
			condition_arr.push({ title: new RegExp(req.query.search_string, 'i') })
		}
		if (req.query.search_tag !== undefined && req.query.search_tag !== '') {
			var arrayOfTagSearch = req.query.search_tag.split(','); var arrayOfTagSearchCaseSenstive = [];
			arrayOfTagSearch.forEach(function (item) {
				arrayOfTagSearchCaseSenstive.push(item);
			})
			condition_arr.push({ hash_tag: { $in: arrayOfTagSearchCaseSenstive } })
		}
		if (req.query.date_range !== undefined && req.query.date_range !== '') {
			var arrVars = req.query.date_range.split("/");
			if (arrVars.length === 2) {
				const start = new Date(arrVars[0]);
				start.setHours(0, 0, 0, 0);
				const end = new Date(arrVars[1]);
				end.setHours(23, 59, 59, 999);
				condition_arr.push({ created_at: { $gte: start, $lte: end } });
			}
		}
		if (condition_arr.length === 1) {
			query = condition_arr[0]
		} else if (condition_arr.length > 1) {
			query = { $and: condition_arr }
		}

		var options = { sort: { _id: -1 }, populate: ['user', 'story_file'], page: Number(req.query.page), limit: Number(req.query.limit) };
		return UserStory.paginate(query, options)
			.then(result => res.status(200).send({ type: 'success', message: "List of stories get successfully.", data: result }))
			.catch(error => res.status(200).send({ type: 'error', message: error.message }));
	}

	async uploadFile(req, res, storyData) {
		var files = req.files;
		await files.forEach(async (file) => {
			//const ext = file.mimetype.split("/")[1];
			//const fileName = Date.now() + '.' + ext;
			let fileName = file.originalname.replace(/\s/g, "");
			const FOLDER_PATH = 'story/' + storyData._id;
			const PRODUCT_UPLOAD_PATH = FOLDER_PATH + '/' + fileName;
			let params = { Bucket: process.env.AWS_S3_BUCKET_NAME, Key: PRODUCT_UPLOAD_PATH, Body: file.buffer, ContentType: file.mimetype };
			let uploadPromise = await S3.upload(params).promise();
			let file_data = new StoryFile({ bucket_name: process.env.AWS_S3_BUCKET_NAME, story_id: storyData._id, name: fileName, path: uploadPromise.Key, mime: file.mimetype })
			file_data.save().then(function (result, error) {
				if (result) {
					new UserStoryController().updateStoryFileData(storyData, result);
				}
			})
				.catch(error => { });
		});
	}

	async updateStoryFileData(storyData, file_data) {
		await UserStory.findByIdAndUpdate(storyData._id, { $push: { story_file: file_data._id } }, { new: true });
	}

}