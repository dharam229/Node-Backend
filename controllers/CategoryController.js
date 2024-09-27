const models = require('../models');
const Category = models.Category;
const Advertisement = models.Advertisement;
const Fs = require('fs');
module.exports = class CategoryController {
	
	/****Save New Category Data**************/
	async createCategory(req, res) {
		//console.log('req.body', req.body)
		if (req.user.role !== 1) {
			return res.status(200).send({ type: 'error', message: 'You are not authorized for this operation' })
		}
		req.body.created_by = req.user.user_id;
		req.body.updated_by = req.user.user_id;
		let category = new Category(req.body)
		return category.save()
			.then(function (result, error) {
				if (result) {
					res.status(200).send({ type: 'success', message: "Category data added successfully", data: result })
				} else {
					res.status(200).send({ type: 'error', message: error.message })
				}
			})
			.catch(error => res.status(200).send({ type: 'error', message: error.message }));
	}

	/****Get Form Pre Add Edit data**************/
	async formAddEditData(req, res) {
		var cat_data = req.params.id !== '0' ? await Category.findById(req.params.id).exec() : {};
		return res.status(200).send({ type: 'success', message: "", data: cat_data })
	}

	/****Update Category Data**************/
	async updateCategory(req, res) {
		if (req.user.role !== 1) {
			return res.status(200).send({ type: 'error', message: 'You are not authorized for this operation' })
		}
		req.body.updated_by = req.user.user_id;
		return Category.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true })
			.then(function (result, error) {
				if (result) {
					res.status(200).send({ type: 'success', message: "Category data updated successfully", data: result })
				} else {
					res.status(200).send({ type: 'error', message: error.message })
				}
			})
			.catch(error => res.status(200).send({ type: 'error', message: error.message }));

	}

	/****Get List Of Category and filter**************/
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
		
		return Category.paginate(query, options)
			.then(result => res.status(200).send({ type: 'success', message: "", data: result }))
			.catch(error => res.status(200).send({ type: 'error', message: error.message }));
	}
	
	/****Get List Of all the Category**************/
	async allData(req, res){
		var query = {};
		var condition_arr = [];
		condition_arr.push({ status: 1 })
		req.query.type !== undefined && Number(req.query.type) === 2 ? condition_arr.push({ created_by: req.user.user_id }) : '';
		req.query.country !== undefined && req.query.country !== '' ? condition_arr.push({ country: new RegExp(req.query.country, 'i') }) : '';
		req.query.state !== undefined && req.query.state !== '' ? condition_arr.push({ state: new RegExp(req.query.state, 'i') }) : '';
		req.query.city !== undefined && req.query.city !== '' ? condition_arr.push({ city: new RegExp(req.query.city, 'i') }) : '';
		
		if (condition_arr.length === 1) {
			query = condition_arr[0]
		} else if (condition_arr.length > 1) {
			query = { $and: condition_arr }
		}
		
		var categories = await Advertisement.aggregate([
		  { $match : query },
		  {	$group : { _id : "$category_id", count: { $sum: 1 }	} },
		  {	$sort : { count: -1 } }
		 ]).exec();
		
		var allcategories = await Category.find({status: 1}).exec();
		var allresult = [];
		if(allcategories){
			var allresult = await Promise.all(allcategories.map(async (item) => {
								var obj = categories.filter(function ( cat ) {
												return String(cat._id) === String(item._id);
											})[0];
								if(!obj){
									return {'id': String(item._id), 'name': item.name, 'active_product': 0};
								}else{
									return {'id': String(item._id), 'name': item.name, 'active_product': obj.count};
								}
							}))
		}		
		
		return 	res.status(200).send({ type: 'success', message: "", data: allresult });
	}
	
	async getCateogoryName(category) {
		let cat = await Category.findOne({_id: category._id}).exec()
		return {'id': category._id, 'name': cat.name, 'active_product': category.count};
		//console.log('forloop_data', forloop_data)					
		//return new_array;
	}

	/****Get Single Category Detail**************/
	async view(req, res) {
		//console.log(req.params.id);
		return await Category.findById(req.params.id)
			.then(result => res.status(200).send({ type: 'success', message: "", data: result }))
			.catch(error => res.status(200).send({ type: 'error', message: error.message }));

	}
	
	/****Update Single Category Status**************/
	async updateStatus(req, res) {
		let data = await Category.findById(req.params.id);
		if(data.status === 1 && data.active_products > 0){
			return res.status(200).send({ type: 'success', message: "Category cannot be deactivated as it have active products." });
		}
		
		let new_status = data.status === 1 ? 0 : 1;
		return await Category.findOneAndUpdate({ _id: req.params.id }, { status: new_status }, { new: true })
			.then(result => res.status(200).send({ type: 'success', message: "Category status updated successfully." }))
			.catch(error => res.status(200).send({ type: 'error', message: error.message }));
	}
	
	/****Delete Category**************/
	async delete(req, res) {
		if (Number(req.user.role) !== 1) {
			return res.status(200).send({ type: 'error', message: 'You are not authorized for this operation' })
		}
		//Before deleting put all the products under the others category
		var undefined_cat = await Category.findOne({name: new RegExp('undefined', 'i')});
		if(undefined_cat){
			if(undefined_cat._id.toString() === req.params.id){
				return res.status(200).send({ type: 'error', message: "You cannot delete this category. It is default required." })
			}
			Advertisement.updateMany({category_id: req.params.id}, {category_id: undefined_cat.id});
			
			return await Category.deleteOne({ _id: req.params.id })
				.then(data => res.status(200).send({ type: 'success', message: "Selected Category deleted successfully" }))
				.catch(error => res.status(200).send({ type: 'error', message: error.message }));
		}else{
			return res.status(200).send({ type: 'error', message: "Please create a undefined category before deleting so that all product related to this category can be moved to undefined category" })
		}		
	}

}