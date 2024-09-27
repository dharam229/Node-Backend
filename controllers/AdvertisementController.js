const models = require('../models');
const Category = models.Category;
const Ads = models.Advertisement;
const AdsFiles = models.AdvertisementFile;
const { CurrencyOptions } = require('../configs/constant');
const Fs = require('fs');
const AWS = require('aws-sdk');
const S3 = new AWS.S3({ accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID, secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY })

module.exports = class AdvertisementController {

	/****Save New Ads Data**************/
	async create(req, res) {
		req.body.created_by = req.user.user_id;
		req.body.updated_by = req.user.user_id;
		req.body.bucket_name = process.env.AWS_S3_BUCKET_NAME;
		let ads = new Ads(req.body)
		return ads.save()
			.then(function (result, error) {
				if (result) {
					//If have any file save them
					if (req.files.length > 0) {
						new AdvertisementController().uploadAdvertisementFile(req, res, result);
					}
					//increase category active product count
					new AdvertisementController().increaseCategoryActiveProducts(req.body.category_id);
					res.status(200).send({ type: 'success', message: "Ads data added successfully", data: result })
				} else {
					res.status(200).send({ type: 'error', message: error.message })
				}
			})
			.catch(error => res.status(200).send({ type: 'error', message: error.message }));
	}

	/****Get Form Pre Add Edit data**************/
	async formAddEditData(req, res) {
		var all_categories = await Category.find({ status: 1 });
		var adv_data = req.params.id !== '0' ? await Ads.findById(req.params.id).populate('advertisement_file').exec() : {};
		return res.status(200).send({ type: 'success', message: "", data: adv_data, categories: all_categories })
	}
	
	/****Get Currency List data**************/
	async getCurrencyList(req, res) {
		return res.status(200).send({ type: 'success', message: "", data: CurrencyOptions })
	}

	/****Update Ads Data**************/
	async update(req, res) {
		//Compare old and new status change category active product count
		var data = await Ads.findById(req.params.id);
		if (req.user.role !== 1 && data.created_by.toString() !== req.user.user_id) {
			return res.status(200).send({ type: 'error', message: 'You are not authorized for this operation'+ typeof req.user.user_id })
		}
		if (data.status === 1 && req.body.status === 0) {
			//decrease category active product count
			new AdvertisementController().decreaseCategoryActiveProducts(req.body.category_id);
		} else if (data.status === 0 && req.body.status === 1) {
			//increase category active product count
			new AdvertisementController().increaseCategoryActiveProducts(req.body.category_id);
		}
		req.body.updated_by = req.user.user_id;
		return Ads.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true })
			.then(function (result, error) {
				if (result) {
					//If have any file save them
					if (req.files.length > 0) {
						new AdvertisementController().uploadAdvertisementFile(req, res, result);
					}
					res.status(200).send({ type: 'success', message: "Ads data updated successfully", data: result })
				} else {
					res.status(200).send({ type: 'error', message: error.message })
				}
			})
			.catch(error => res.status(200).send({ type: 'error', message: error.message }));

	}

	/****Get List Of all the Ads**************/
	async listData(req, res) {
		if (req.user.role !== 1) {
			return res.status(200).send({ type: 'error', message: 'You are not authorized for this operation' })
		}
		var query = {};
		var condition_arr = [];
		req.query.search_string !== undefined && req.query.search_string !== '' ? condition_arr.push({ title: new RegExp(req.query.search_string, 'i') }) : '';
		req.query.status !== undefined && req.query.status !== '' && req.query.status !== 2 ? condition_arr.push({ status: Number(req.query.status) }) : '';
		req.query.category_id !== undefined && req.query.category_id !== '' ? condition_arr.push({ category_id: req.query.category_id }) : '';
		if (condition_arr.length === 1) {
			query = condition_arr[0]
		} else if (condition_arr.length > 1) {
			query = { $and: condition_arr }
		}

		var options = { sort: { _id: -1 }, populate: ['created_by', 'advertisement_file', 'category_id'], page: Number(req.query.page), limit: Number(req.query.limit) };

		var all_categories = await Category.find({ status: 1 });

		return Ads.paginate(query, options)
			.then(result => res.status(200).send({ type: 'success', message: "", data: result, categories: all_categories }))
			.catch(error => res.status(200).send({ type: 'error', message: error.message }));
	}

	async categoryAdvertisement(req, res) {
		var query = {};
		//var condition_arr = [{ category_id: req.params.id }];
		var condition_arr = [];
		req.params.id !== '0' ? condition_arr.push({ category_id: req.params.id }) : '';
		req.query.search_string !== undefined && req.query.search_string !== '' ? condition_arr.push({ $or: [{ title: new RegExp(req.query.search_string, 'i') }, { description: new RegExp(req.query.search_string, 'i') }] }) : '';

		req.query.search_address !== undefined && req.query.search_address !== '' ? condition_arr.push({ $or: [{ country: new RegExp(req.query.search_address, 'i') }, { state: new RegExp(req.query.search_address, 'i') }, { city: new RegExp(req.query.search_address, 'i') }] }) : '';

		req.query.search_min_price !== undefined && req.query.search_min_price !== '' && req.query.search_max_price !== undefined && req.query.search_max_price !== '' ? condition_arr.push({ price: { $lte: req.query.search_max_price, $gte: req.query.search_min_price } }) : '';

		req.query.advertisement_type !== undefined && Number(req.query.advertisement_type) === 1 ? condition_arr.push({ created_by: req.user.user_id }) : '';

		let page = req.query.page !== undefined ? req.query.page : 1;
		let limit = req.query.limit !== undefined ? req.query.limit : 10;
		var options = { sort: { _id: -1 }, populate: ['created_by', 'advertisement_file', 'category_id'], page: Number(page), limit: Number(limit) };

		if (condition_arr.length === 1) {
			query = condition_arr[0]
		} else if (condition_arr.length > 1) {
			query = { $and: condition_arr }
		}
		return Ads.paginate(query, options)
			.then(result => res.status(200).send({ type: 'success', message: "", data: result }))
			.catch(error => res.status(200).send({ type: 'error', message: error.message }));
	}

	/****Get Single Ads Detail**************/
	async view(req, res) {
		//console.log(req.params.id);
		return await Ads.findById(req.params.id).populate(['created_by', 'advertisement_file', 'category_id'])
			.then(result => res.status(200).send({ type: 'success', message: "", data: result }))
			.catch(error => res.status(200).send({ type: 'error', message: error.message }));

	}

	/****Update Single Ads Status**************/
	async updateStatus(req, res) {
		let data = await Ads.findById(req.params.id);

		let new_status = data.status === 1 ? 0 : 1;
		return await Ads.findOneAndUpdate({ _id: req.params.id }, { status: new_status }, { new: true })
			.then(result => res.status(200).send({ type: 'success', message: "Ads status updated successfully." }))
			.catch(error => res.status(200).send({ type: 'error', message: error.message }));
	}

	/****Delete Ads**************/
	async delete(req, res) {
		console.log('req.user', req.user)
		var data = await Ads.findById(req.params.id);
		console.log('check user', data.created_by)
		if (Number(req.user.role) !== 1 && data.created_by.toString() !== req.user.user_id) {
			return res.status(200).send({ type: 'error', message: 'You are not authorized for this operation' })
		}
		if (Number(data.status) === 1) {
			//decrease category active product count
			new AdvertisementController().decreaseCategoryActiveProducts(data.category_id);
		}
		//First Delete all files realted to Advertisement
		await AdsFiles.deleteMany({ advertisement_id: data._id });
		//Remove product folder and its content(files)
		let dir = process.env.UPLOAD_BASE + '/advertisement/' + data._id;
		if (Fs.existsSync(dir)) {
			Fs.rmdirSync(dir, { recursive: true })
		}
		//Now remove the advertisement
		return await Ads.deleteOne({ _id: req.params.id })
			.then(data => res.status(200).send({ type: 'success', message: "Advertisement deleted successfully" }))
			.catch(error => res.status(200).send({ type: 'error', message: error.message }));
	}

	/***************Upload Advertisement File************/
	async uploadAdvertisementFile(req, res, advdata) {
		var files = req.files;
		if (files.length > 0) {
			await files.forEach(async (file) => {
				let FOLDER_PATH = 'advertisement'
				let ext = file.mimetype.split("/")[1];
				let fileName = Date.now() + '.' + ext
				let FILE_UPLOAD_PATH = FOLDER_PATH + '/' + advdata._id + '/' + fileName;
				let params = { Bucket: process.env.AWS_S3_BUCKET_NAME, Key: FILE_UPLOAD_PATH, Body: file.buffer, ContentType: file.mimetype };
				let uploadPromise = await S3.upload(params).promise();
				let file_data = new AdsFiles({ bucket_name: process.env.AWS_S3_BUCKET_NAME,advertisement_id: advdata._id, name: fileName, path: uploadPromise.Key, mime: file.mimetype })
				file_data.save().then(function (result, error) {
					if (result) {
						new AdvertisementController().updateAdvertisementFileData(advdata, result);
					}
				})
				.catch(error => { });
			});
		}
	}

	async updateAdvertisementFileData(advdata, file_data) {
		let saved_pro = await Ads.findByIdAndUpdate(advdata._id, { $push: { advertisement_file: file_data._id } }, { new: true });
	}

	/****Get List Of all the Advertisement all Files**************/
	async advertisementFiles(req, res) {
		return AdsFiles.find({ advertisement_id: req.params.id })
			.then(result => res.status(200).send({ type: 'success', message: "", data: result }))
			.catch(error => res.status(200).send({ type: 'error', message: error.message }));
	}

	/****Delete Advertisement Files**************/
	async deleteAdvertisementFiles(req, res) {
		let data = await AdsFiles.findById(req.params.id);
		if (data) {
			new AdvertisementController().removeAdvertisementFiles(data);
		}
		let item_id = data.advertisement_id;
		await data.remove();
		return AdsFiles.find({ advertisement_id: item_id })
			.then(data => res.status(200).send({ type: 'success', message: "Selected image deleted successfully", product_image: data }))
			.catch(error => res.status(200).send({ type: 'error', message: error.message }));
	}

	/***************Remove Advertisement Files************/
	async removeAdvertisementFiles(file_data) {
		var oldFileParams = { Bucket: file_data.bucket_name, Key: file_data.path };
		await S3.deleteObject(oldFileParams).promise();
		Ads.findByIdAndUpdate(file_data.advertisement_id, { $pull: { advertisement_file: file_data._id } }, { new: true });
	}

	/****Increase Category active product count**************/
	async increaseCategoryActiveProducts(category_id) {
		if (category_id) {
			await Category.findOneAndUpdate({ _id: category_id }, { $inc: { active_products: 1 } }).exec();
		}
	}

	/****Update Category active product count**************/
	async decreaseCategoryActiveProducts(category_id) {
		if (category_id) {
			await Category.findOneAndUpdate({ _id: category_id }, { $inc: { active_products: -1 } }).exec();
		}
	}
}