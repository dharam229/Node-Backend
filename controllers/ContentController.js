const models = require('../models');
const Content = models.Content;
const Advertisement = models.Advertisement;
const Fs = require('fs');
module.exports = class ContentController {
	
	/****Save New Content Data**************/
	async createContent(req, res) {
		//console.log('req.body', req.body)
		if (req.user.role !== 1) {
			return res.status(200).send({ type: 'error', message: 'You are not authorized for this operation' })
		}
		req.body.created_by = req.user.user_id;
		req.body.updated_by = req.user.user_id;
		req.body.slug       = await new ContentController().stringToSlug(req.body.name);
		let content = new Content(req.body)
		return content.save()
			.then(function (result, error) {
				if (result) {
					res.status(200).send({ type: 'success', message: "Content data added successfully", data: result })
				} else {
					res.status(200).send({ type: 'error', message: error.message })
				}
			})
			.catch(error => res.status(200).send({ type: 'error', message: error.message }));
	}

	/****Get Form Pre Add Edit data**************/
	async formAddEditData(req, res) {
		var cat_data = req.params.id !== '0' ? await Content.findById(req.params.id).exec() : {};
		return res.status(200).send({ type: 'success', message: "", data: cat_data })
	}

	/****Update Content Data**************/
	async updateContent(req, res) {
		if (req.user.role !== 1) {
			return res.status(200).send({ type: 'error', message: 'You are not authorized for this operation' })
		}
		req.body.updated_by = req.user.user_id;
		req.body.slug       = await new ContentController().stringToSlug(req.body.name);
		return Content.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true })
			.then(function (result, error) {
				if (result) {
					res.status(200).send({ type: 'success', message: "Content data updated successfully", data: result })
				} else {
					res.status(200).send({ type: 'error', message: error.message })
				}
			})
			.catch(error => res.status(200).send({ type: 'error', message: error.message }));

	}

	/****Get List Of Content and filter**************/
	async listData(req, res) {
		if (req.user.role !== 1) {
			return res.status(200).send({ type: 'error', message: 'You are not authorized for this operation' })
		}
		//console.log(req.query)
		var query = {};
		var condition_arr = [];
		req.query.search_string !== undefined && req.query.search_string !== '' ? condition_arr.push({ name: new RegExp(req.query.search_string, 'i') }) : '';
		req.query.status !== undefined && req.query.status !== '' && Number(req.query.status) !== 2 ? condition_arr.push({ status: Number(req.query.status) }) : '';
		if (condition_arr.length === 1) {
			query = condition_arr[0]
		} else if (condition_arr.length > 1) {
			query = { $and: condition_arr }
		}
		var options = { sort: { _id: -1 }, populate: ['created_by'], page: Number(req.query.page), limit: Number(req.query.limit) };
		
		return Content.paginate(query, options)
			.then(result => res.status(200).send({ type: 'success', message: "", data: result }))
			.catch(error => res.status(200).send({ type: 'error', message: error.message }));
	}
	
	
	/****Get Single Content Detail**************/
	async view(req, res) {
		//console.log(req.params.id);
		return await Content.findById(req.params.id)
			.then(result => res.status(200).send({ type: 'success', message: "", data: result }))
			.catch(error => res.status(200).send({ type: 'error', message: error.message }));

	}
	
	/****Update Single Content Status**************/
	async updateStatus(req, res) {
		let data = await Content.findById(req.params.id);
		if(data.status === 1 && data.active_products > 0){
			return res.status(200).send({ type: 'success', message: "Content cannot be deactivated as it have active products." });
		}
		
		let new_status = data.status === 1 ? 0 : 1;
		return await Content.findOneAndUpdate({ _id: req.params.id }, { status: new_status }, { new: true })
			.then(result => res.status(200).send({ type: 'success', message: "Content status updated successfully." }))
			.catch(error => res.status(200).send({ type: 'error', message: error.message }));
	}
	
	/****Delete Content**************/
	async delete(req, res) {
		if (req.user.role !== 1) {
			return res.status(200).send({ type: 'error', message: 'You are not authorized for this operation' })
		}
		
		return await Content.deleteOne({ _id: req.params.id })
			.then(data => res.status(200).send({ type: 'success', message: "Selected Content deleted successfully" }))
			.catch(error => res.status(200).send({ type: 'error', message: error.message }));	
	}
	
	
	async getPage(req, res){
		console.log('comming to get page function', req.params.slug)
		var result = await Content.findOne({ slug: new RegExp(req.params.slug, 'i') }).exec();
		if(result){
			return res.status(200).send({ type: 'success', message: "", data: result.content });
		}else{
			res.status(200).send({ type: 'error', message: 'Page not found' })
		}
	}
	
	async stringToSlug(str){
		str = str.replace(/^\s+|\s+$/g, ''); // trim
		str = str.toLowerCase();

		str = str.replace(/[^a-z0-9 -]/g, '') // remove invalid chars
			.replace(/\s+/g, '-') // collapse whitespace and replace by -
			.replace(/-+/g, '-'); // collapse dashes
		console.log('str', str)
		return str;
	}

}