const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const models = require('../models');
const sendEmail = require("../utils/sendEmail");
const config = require('../config');
const User = models.User;
const Subscription = models.Subscription;
const stripe = require('stripe')(process.env.STRIPE_API_KEY);
const Fs = require('fs');
const crypto = require("crypto");
var ObjectId = require('mongodb').ObjectID;


module.exports = class WebhookController {
	
	/****Save New customer Data**************/
	async webhooksForSubscriptions(request, response) {
		const event = request.body;
		var paymentIntent = {};
		var paymentIntent1 = {};
		var updated = {};
		switch (event.type) {
			case 'invoice.created':
				paymentIntent = event.data.object;
				break;
			case "invoice.deleted":
				paymentIntent = event.data.object;
				break;
			case 'invoice.finalization_failed':
				paymentIntent = event.data.object;
				break;
			case 'invoice.finalized':
				paymentIntent = event.data.object;
				break;
			case 'invoice.paid':
				//send email
				paymentIntent = event.data.object;
				addData(paymentIntent)
				break;
			case 'invoice.payment_succeeded':
				paymentIntent = event.data.object;
				break;
			case 'invoice.payment_failed':
				paymentIntent = event.data.object;
				break;
			case 'invoice.upcoming':
				paymentIntent = event.data.object;
				break;
			case 'invoice.updated':
				paymentIntent = event.data.object;
				break;
			case 'customer.subscription.created':
				paymentIntent1 = event.data.object;
				break;
			case 'subscription_schedule.canceled':
				paymentIntent = event.data.object;
				break;
			case 'subscription_schedule.completed':
				paymentIntent = event.data.object;
				break;
			case 'subscription_schedule.created':
				paymentIntent = event.data.object;
				break;	
			case 'customer.subscription.updated':
				updated = event.data.object;
				var subscription = new WebhookController().updateSubscriptionStatus(updated)
				break;
			case 'customer.subscription.deleted':
				paymentIntent = event.data.object;
				
				break;
			default:
		}
		response.send();
	}

	

	async updateSubscriptionStatus(subscriptionData) {
		var subsdata = {};
			//subsdata.created_by = req.user.user_id;
            //subsdata.updated_by = req.user.user_id;
            //subsdata.plan_id = req.body.plan_id;
            subsdata.subscription_id = subscriptionData.id;
            subsdata.default_payment_method = subscriptionData.default_payment_method;
            subsdata.canceled_at = subscriptionData.canceled_at;
            subsdata.cancel_at_period_end = subscriptionData.cancel_at_period_end;
            subsdata.collection_method = subscriptionData.collection_method;
            subsdata.currency = subscriptionData.currency;
            subsdata.current_period_end = subscriptionData.current_period_end;
            subsdata.discount = 0;
            subsdata.sub_type = 'New';
            subsdata.coupon = null;
            subsdata.unit_amount = (subscriptionData.items.data[0].price.unit_amount) / (100);
            subsdata.current_period_start = subscriptionData.current_period_start;
            subsdata.customer = subscriptionData.customer;
            subsdata.stripe_status = subscriptionData.status;
            let subscription = new Subscription(subsdata)
            return subscription.save()
                .then(async function (result, error) {
                    if (result) {
                        req.body.net_amount = (subsdata.unit_amount) - (subsdata.discount)
                        await new SubscriptionReport(subsdata).save()
                        //await User.findOneAndUpdate({ _id: req.user.user_id }, { sub_date: subscriptionData.current_period_start, sub_reneual_date: subscriptionData.current_period_end, plan_id: req.body.plan_id }).exec();
                        res.status(200).send({ type: 'success', message: "Subscription has been created successfully", data: result })
                    } else {
                        res.status(200).send({ type: 'error', message: error.message })
                    }
                })
		/*Membership.findOneAndUpdate({ id: paymentIntent.id }, { $set: { cancel_at_period_end: paymentIntent.cancel_at_period_end, canceled_at: paymentIntent.canceled_at, ended_at: paymentIntent.ended_at, status: paymentIntent.status } }, { new: true }, (err, doc) => {
			if (err) {
				console.log("Something wrong when updating data!", err);
			}
			console.log("Done");
		});*/
	}

	
}