const models = require('../models');
const Plan = models.Plan;
const User = models.User;
const Coupon = models.Coupon;
const moment = require("moment");
const Subscription = models.Subscription;
const SubscriptionReport = models.SubscriptionReport;
const { SECRET_KEY, PRODUCT_STRIPE } = process.env;
const sendEmail = require("../utils/sendEmail");
const stripe = require('stripe')(SECRET_KEY);

module.exports = class SubscriptionController {

    /**** Create New Subscription For User **************/
    async create(req, res) {
        const customerId = req.user.stripe_customer;
		const priceId = req.body.priceId;
		try {
			// Create the subscription. Note we're expanding the Subscription's
			// latest invoice and that invoice's payment_intent
			// so we can pass it to the front end to confirm the payment
			const subscription = await stripe.subscriptions.create({
			  customer: customerId,
			  items: [{
				price: priceId,
			  }],
			  payment_behavior: 'default_incomplete',
			  payment_settings: { save_default_payment_method: 'on_subscription' },
			  expand: ['latest_invoice.payment_intent'],
			});

			return res.send({ type: 'success', message: "", subscriptionId: subscription.id, clientSecret: subscription.latest_invoice.payment_intent.client_secret });
		} catch (error) {
			return res.status(400).send({ type: 'error', message: error.message });
		}
    }
	
	/**** Create New Subscription For User **************/
    async updatePaymentStatus(req, res) {
		try {
			// Create the subscription. Note we're expanding the Subscription's
			// latest invoice and that invoice's payment_intent
			// so we can pass it to the front end to confirm the payment
			await User.findOneAndUpdate({ _id: req.user.user_id }, { plan_id: req.body.plan_id, payment_status: req.body.payment_status, payment_refrence_token: req.body.payment_token }).exec();

			return res.send({ type: 'success', message: "User payment status updated successfully" });
		} catch (error) {
			return res.status(400).send({ type: 'error', message: error.message });
		}
    }
	
	/*async create(req, res) {
        try {
            let subscriptionBody = { customer: req.user.stripe_customer, items: [{ price: req.body.price_id }] };
            let discount = 0; var couponData;
            if (req.body.coupon !== undefined && req.body.coupon !== '') {
                let planData = await Plan.findOne({ plan_id: req.body.price_id }).exec();
                couponData = await Coupon.findOne({ code: req.body.coupon }).exec();
                if (couponData.status !== 1) {
                    return res.status(200).send({ type: 'error', message: 'This coupon is no longer active, please try another one' })
                }
                discount = couponData.value;
                if (couponData.discount_type === 1) {
                    discount = (((couponData.value) / (100)) * (planData.unit_amount))
                }
                subscriptionBody = { customer: req.user.stripe_customer, items: [{ price: req.body.price_id }], coupon: req.body.coupon };
                couponData.number_of_user_used = couponData.number_of_user_used + 1;
                if (couponData.number_of_user_used === couponData.quantity) {
                    couponData.status = 0;
                }
                couponData.save();
            }

            if (req.user.stripe_customer === undefined || req.user.stripe_customer === '') {
                return res.status(200).send({ type: 'error', message: 'Please create a customer over the stripe first, then try again' })
            }
            //Create a payment method that was using instead of card api
            const paymentMethods = await stripe.paymentMethods.create({ type: 'card', card: { number: req.body.card_number, exp_month: req.body.exp_month, exp_year: req.body.exp_year, cvc: req.body.cvc } });
            // Attached payment method to stripe customer
            await stripe.paymentMethods.attach(paymentMethods.id, { customer: req.user.stripe_customer });
            // Update the default payment method for the customer
            await stripe.customers.update(req.user.stripe_customer, { invoice_settings: { default_payment_method: paymentMethods.id } });

            const subscriptionData = await stripe.subscriptions.create(subscriptionBody);
            req.body.created_by = req.user.user_id;
            req.body.updated_by = req.user.user_id;
            req.body.plan_id = req.body.plan_id;
            req.body.subscription_id = subscriptionData.id;
            req.body.default_payment_method = subscriptionData.default_payment_method;
            req.body.canceled_at = subscriptionData.canceled_at;
            req.body.cancel_at_period_end = subscriptionData.cancel_at_period_end;
            req.body.collection_method = subscriptionData.collection_method;
            req.body.currency = subscriptionData.currency;
            req.body.current_period_end = subscriptionData.current_period_end;
            req.body.discount = discount;
            req.body.sub_type = 'New';
            req.body.coupon = (req.body.coupon !== undefined && req.body.coupon !== '') ? couponData.id : null;
            req.body.unit_amount = (subscriptionData.items.data[0].price.unit_amount) / (100);
            req.body.current_period_start = subscriptionData.current_period_start;
            req.body.customer = subscriptionData.customer;
            req.body.stripe_status = subscriptionData.status;
            let subscription = new Subscription(req.body)
            return subscription.save()
                .then(async function (result, error) {
                    if (result) {
                        req.body.net_amount = (req.body.unit_amount) - (req.body.discount)
                        await new SubscriptionReport(req.body).save()
                        await User.findOneAndUpdate({ _id: req.user.user_id }, { sub_date: subscriptionData.current_period_start, sub_reneual_date: subscriptionData.current_period_end, plan_id: req.body.plan_id }).exec();
                        res.status(200).send({ type: 'success', message: "Subscription has been created successfully", data: result })
                    } else {
                        res.status(200).send({ type: 'error', message: error.message })
                    }
                })
                .catch(error => res.status(200).send({ type: 'error', message: error.message }));
        } catch (error) {
            return res.status(200).send({ type: 'error', message: error.message })
        }
    }*/

    async listData(req, res) {
        if (req.user.role !== 1) {
            return res.status(200).send({ type: 'error', message: 'You are not authorized for this operation' })
        }
        var query = {}; var condition_arr = [];
        if (req.query.date_range !== undefined && req.query.date_range !== '') {
            var date_arr = req.query.date_range.split("/").map(item => item.trim());
            const start_date = moment(date_arr[0]).startOf('day').toDate();
            const end_date = moment(date_arr[1]).endOf('day').toDate();
            condition_arr.push({ created_at: { $gte: start_date, $lte: end_date } });
        }
        if (req.query.status !== undefined && req.query.status !== '') {
            if (req.query.status === 'active') {
                condition_arr.push({ stripe_status: 'active' });
            } else if (req.query.status === 'incomplete') {
                condition_arr.push({ stripe_status: 'incomplete' });
            } else if (req.query.status === 'canceled') {
                condition_arr.push({ stripe_status: 'canceled' });
            }
        }
        if (condition_arr.length === 1) {
            query = condition_arr[0]
        } else if (condition_arr.length > 1) {
            query = { $and: condition_arr }
        }
        var populateQuery = [{ path: 'coupon', select: 'discount_type value title' }, { path: 'created_by', select: 'firstname lastname' }, { path: 'plan_id', select: 'recurring unit_amount' }];
        var options = { select: ('coupon created_by sub_type created_at plan_id stripe_status net_amount discount unit_amount'), sort: { _id: -1 }, populate: populateQuery, page: Number(req.query.page), limit: Number(req.query.limit) };
        return SubscriptionReport.paginate(query, options)
            .then(result => res.status(200).send({ type: 'success', message: "Subscription list get successfully.", data: result }))
            .catch(error => res.status(200).send({ type: 'error', message: error.message }));
    }

    async updatePaymentMethods(req, res) {
        try {
            //Create a new payment method 
            const paymentMethods = await stripe.paymentMethods.create({ type: 'card', card: { number: req.body.card_number, exp_month: req.body.exp_month, exp_year: req.body.exp_year, cvc: req.body.cvc } });
            // Attached payment method to stripe customer
            await stripe.paymentMethods.attach(paymentMethods.id, { customer: req.user.stripe_customer });
            // Update the default payment method for the customer
            const newPaymentMethodAdd = await stripe.customers.update(req.user.stripe_customer, { invoice_settings: { default_payment_method: paymentMethods.id } });
            if (newPaymentMethodAdd.id !== undefined) {
                return res.status(200).send({ type: 'success', message: 'Payment method updated successfully.' })
            } else {
                return res.status(200).send({ type: 'error', message: 'There is a problem to create new payment method, please try later.' })
            }
        } catch (error) {
            return res.status(200).send({ type: 'error', message: error.message })
        }
    }

    /**** Cancel Or Resume Subscription**************/
    async cancelOrResumeSubscription(req, res) {
        req.body.updated_by = req.user.user_id;
        try {
            req.body.cancel_at_period_end = (req.body.cancel_at_period_end == 'true') ? true : false;
            const subscriptionData = await stripe.subscriptions.update(req.body.subscription_id, { cancel_at_period_end: !req.body.cancel_at_period_end });

            const updateFields = { cancel_at: subscriptionData.cancel_at, cancel_at_period_end: subscriptionData.cancel_at_period_end, stripe_status: subscriptionData.status }
            //return res.status(200).send({ type: 'error', message: subscriptionData,updateFields:updateFields })
            return Subscription.findOneAndUpdate({ subscription_id: req.body.subscription_id }, { $set: updateFields }, { new: true })
                .then(function (result, error) {
                    if (result) {
                        var message = req.body.cancel_at_period_end ? "Membership Resume Successfully" : "Membership Canceled Successfully";
                        new SubscriptionController().sendEmailOnSubscriptionCancelResume(result, req.body.cancel_at_period_end);
                        res.status(200).send({ type: 'success', message: message, data: result })
                    } else {
                        res.status(200).send({ type: 'error', message: error.message })
                    }
                })
                .catch(error => res.status(200).send({ type: 'error', message: error.message }));

        } catch (error) {
            res.status(400).json(error.message);
        }
    }

    //Send email to user when subscription created
    async sendEmailOnSubscriptionCancelResume(subscriptionData, subscription_resume_cancel) {
        if (subscriptionData) {
            var user = await User.findOne({ _id: subscriptionData.created_by });
            if (user) {
                //Send email to user whom subscription created
                var message = subscription_resume_cancel ? "Your membership is resumed successfully !" : "Your membership is canceled successfully !";
                let data = {
                    firstname: user.firstname,
                    lastname: user.lastname,
                    message: message,
                    facebook: 'https://www.facebook.com/MangoStories',
                    instagram: 'https://www.instagram.com/MangoStories',
                    pinterest: 'https://www.pinterest.com/MangoStories',
                    twitter: 'https://twitter.com/MangoStories',
                    url: process.env.BASE_URL,
                }
                var subject = subscription_resume_cancel ? "Membership Resumed" : "Membership Canceled";
                await sendEmail.sendSubscriptionCancelResumeEmail(user.email, subject, data);
            }
        }
    }

    // Currently Active Subscription
    async currentlyActiveSubscription(req, res) {
        try {
            let subscriptionData = await Subscription.findOne({ created_by: req.user.user_id }).populate('plan_id', 'name type unit_amount plan_id').sort({ _id: -1 }).limit(1).exec();
            if (subscriptionData.id === undefined) res.status(200).send({ type: 'error', message: 'You have not active any membership yet.' })
            res.status(200).send({ type: 'success', message: "Subscription data get successfully.", data: subscriptionData })
        } catch (error) {
            res.status(200).send({ type: 'error', message: error.message });
        }
    }

    /****Save New customer Data**************/
    async webhooksForSubscriptions(request, response) {
        const event = request.body;
        var paymentIntent = {};
        var paymentIntent1 = {};
        var updated = {};
        switch (event.type) {
            case 'invoice.created':
                paymentIntent = event.data.object;
                //new WebhookController().checkWebHookEmail('Invoice created', 'invoice.created')
                new WebhookController().invoiceCreated(paymentIntent)
                break;
            case "invoice.deleted":
                //new WebhookController().checkWebHookEmail('Invoice Deleted', 'invoice.deleted')
                paymentIntent = event.data.object;
                break;
            case 'invoice.finalization_failed':
                //new WebhookController().checkWebHookEmail('Payment Finalized Failded', 'invoice.finalization_failed')
                paymentIntent = event.data.object;
                break;
            case 'invoice.finalized':
                //new WebhookController().checkWebHookEmail('Payment Finalized', 'invoice.finalized')
                paymentIntent = event.data.object;
                break;
            case 'invoice.paid':
                //send email
                paymentIntent = event.data.object;
                //new WebhookController().checkWebHookEmail('Invoice paid', 'invoice.paid')
                addData(paymentIntent)
                break;
            case 'invoice.payment_succeeded':
                //new WebhookController().checkWebHookEmail('Payment Success', 'invoice.payment_succeeded')
                paymentIntent = event.data.object;
                //console.log('invoice.payment_succeeded webhook called event', event)
                //console.log('invoice.payment_succeeded webhook called event.data', event.data)
                //console.log('invoice.payment_succeeded webhook called paymentIntent', paymentIntent)
                new WebhookController().membershipPaymentSuccess(paymentIntent)
                break;
            case 'invoice.payment_failed':
                paymentIntent = event.data.object;
                //new WebhookController().checkWebHookEmail('Invoice Payment Failed', 'invoice.payment_failed')
                new WebhookController().paymentFailed(paymentIntent)
                break;
            case 'invoice.upcoming':
                paymentIntent = event.data.object;
                //new WebhookController().checkWebHookEmail('Invoice Upcoming', 'invoice.upcoming')
                new WebhookController().upcommingPayment(paymentIntent)
                break;
            case 'invoice.updated':
                paymentIntent = event.data.object;
                //new WebhookController().checkWebHookEmail('Invoice Updated', 'invoice.updated')
                break;
            case 'customer.subscription.created':
                paymentIntent1 = event.data.object;
                //new WebhookController().checkWebHookEmail('Subscription customer created', 'customer.subscription.created')
                //console.log("created", paymentIntent1)
                break;
            case 'subscription_schedule.canceled':
                paymentIntent = event.data.object;
                //new WebhookController().checkWebHookEmail('Subscription schedule canceled', 'subscription_schedule.canceled')
                break;
            case 'subscription_schedule.completed':
                paymentIntent = event.data.object;
                //new WebhookController().checkWebHookEmail('Subscription schedule completed', 'subscription_schedule.completed')
                break;
            case 'subscription_schedule.created':
                paymentIntent = event.data.object;
                //new WebhookController().checkWebHookEmail('Subscription schedule created', 'subscription_schedule.created')
                break;
            case 'customer.subscription.updated':
                updated = event.data.object;
                //console.log("updated", updated)
                //new WebhookController().checkWebHookEmail('Subscription customer updated', 'customer.subscription.updated')
                var subscription = new WebhookController().updateSubscriptionStatus(updated)
                break;
            case 'customer.subscription.deleted':
                paymentIntent = event.data.object;
                //send info email to user that his acoount is degraded to basic
                new WebhookController().membershipDeleted(paymentIntent)
                //inactivate user all product so that he can be converted to basic acoount
                var subscription = new WebhookController().updateSubscriptionDelted(paymentIntent)
                break;
            default:
        }
        response.send();
    }
}