const moment = require("moment");
const models = require('../models');
const Coupon = models.Coupon;
const Fs = require('fs');
const { SECRET_KEY, PRODUCT_STRIPE } = process.env;
const stripe = require('stripe')(SECRET_KEY);

module.exports = class CouponController {

	/****Save New Coupon Data**************/
	async create(req, res) {
		try {
			if (req.user.role !== 1) {
				return res.status(200).send({ type: 'error', message: 'You are not authorized for this operation' })
			}
			let discount_type = Number(req.body.discount_type) === 1 ? 'percent_off' : 'amount_off';
			let discount_value = Number(req.body.discount_type) === 1 ? parseFloat(req.body.value) : parseInt((req.body.value) * (100));
			let bodyDataForStripe = {};
			if (Number(req.body.per_user) === 1) {
				bodyDataForStripe = { name: req.body.title, max_redemptions: Number(req.body.quantity), currency: 'usd', [discount_type]: discount_value, duration: 'once' };
			} else {
				bodyDataForStripe = { name: req.body.title, max_redemptions: Number(req.body.quantity), currency: 'usd', [discount_type]: discount_value, duration: 'repeating', duration_in_months: Number(req.body.per_user) };
			}
			const couponStripe = await stripe.coupons.create(bodyDataForStripe);
			req.body.created_by = req.user.user_id;
			req.body.updated_by = req.user.user_id;
			req.body.code = couponStripe.id;
			let coupon = new Coupon(req.body)
			return coupon.save()
				.then(function (result, error) {
					if (result) {
						res.status(200).send({ type: 'success', message: "Coupon data added successfully", data: result })
					} else {
						res.status(200).send({ type: 'error', message: error.message })
					}
				})
				.catch(error => res.status(200).send({ type: 'error', message: error.message }));
		} catch (error) {
			return res.status(200).send({ type: 'error', message: error.message })
		}
	}

	/****Get Form Pre Add Edit data**************/
	async formAddEditData(req, res) {
		var cat_data = req.params.id !== '0' ? await Coupon.findById(req.params.id).exec() : {};
		return res.status(200).send({ type: 'success', message: "", data: cat_data })
	}

	/****Update Coupon Data**************/
	async update(req, res) {
		if (req.user.role !== 1) {
			return res.status(200).send({ type: 'error', message: 'You are not authorized for this operation' })
		}
		req.body.updated_by = req.user.user_id;
		return Coupon.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true })
			.then(function (result, error) {
				if (result) {
					res.status(200).send({ type: 'success', message: "Coupon data updated successfully", data: result })
				} else {
					res.status(200).send({ type: 'error', message: error.message })
				}
			})
			.catch(error => res.status(200).send({ type: 'error', message: error.message }));

	}

	/****Get List Of Coupon and filter**************/
	async listData(req, res) {
		if (req.user.role !== 1) {
			return res.status(200).send({ type: 'error', message: 'You are not authorized for this operation' })
		}
		//console.log(req.query)
		var query = {};
		var condition_arr = [];
		if (req.query.search_string !== undefined && req.query.search_string !== '') {
			condition_arr.push({ $or: [{ title: new RegExp(req.query.search_string, 'i') }, { code: new RegExp(req.query.search_string, 'i') }] })
		}
		if (req.query.coupon_type !== undefined && req.query.coupon_type !== '' && Number(req.query.coupon_type) !== 0) {
			if (Number(req.query.coupon_type) === 1) {
				const today_date = moment().format('YYYY-MM-DD');
				condition_arr.push({ $and: [{ start_date: { $lte: today_date } }, { end_date: { $gte: today_date } }] })
			} else if (Number(req.query.coupon_type) === 2) {
				const today_date = moment().format('YYYY-MM-DD');
				condition_arr.push({ start_date: { $gte: today_date } })
			} else if (Number(req.query.coupon_type) === 3) {
				const today_date = moment().format('YYYY-MM-DD');
				condition_arr.push({ end_date: { $lt: today_date } })
			}
		}

		if (condition_arr.length === 1) {
			query = condition_arr[0]
		} else if (condition_arr.length > 1) {
			query = { $and: condition_arr }
		}
		var options = { sort: { _id: -1 }, populate: ['created_by'], page: Number(req.query.page), limit: Number(req.query.limit) };

		return Coupon.paginate(query, options)
			.then(result => res.status(200).send({ type: 'success', message: "", data: result }))
			.catch(error => res.status(200).send({ type: 'error', message: error.message }));
	}

	/************ Verify Coupon ***********/
	async verifyCoupon(req,res){
        var couponData = req.params.code !== '' ? await Coupon.findOne({ code: req.params.code }).exec() : null;
        if(couponData !== null && couponData.status === 1){
            return res.status(200).send({ type: 'success', message: "Coupon is valid", data: couponData });
        }else{
            return res.status(200).send({ type: 'error', message: 'This coupon is no longer active, please try another one' });
        }
    }

	/****Get Single Coupon Detail**************/
	async view(req, res) {
		//console.log(req.params.id);
		return await Coupon.findById(req.params.id)
			.then(result => res.status(200).send({ type: 'success', message: "", data: result }))
			.catch(error => res.status(200).send({ type: 'error', message: error.message }));

	}

	/****Update Single Coupon Status**************/
	async updateStatus(req, res) {
		let data = await Coupon.findById(req.params.id);
		let new_status = data.status === 1 ? 0 : 1;
		return await Coupon.findOneAndUpdate({ _id: req.params.id }, { status: new_status }, { new: true })
			.then(result => res.status(200).send({ type: 'success', message: "Coupon status updated successfully." }))
			.catch(error => res.status(200).send({ type: 'error', message: error.message }));
	}

	/****Delete Coupon**************/
	async delete(req, res) {
		if (req.user.role !== 1) {
			return res.status(200).send({ type: 'error', message: 'You are not authorized for this operation' })
		}
		//Before deleting put all the products under the others Coupon
		return await Coupon.deleteOne({ _id: req.params.id })
			.then(data => res.status(200).send({ type: 'success', message: "Selected Coupon deleted successfully" }))
			.catch(error => res.status(200).send({ type: 'error', message: error.message }));
	}

}