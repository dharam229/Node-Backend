const moment = require("moment");
const models = require('../models');
const Notification = models.Notification;

module.exports = class NotificationController {

	/****Save New Notification Data**************/
	async createNotification(req, res) {
		req.body.created_by = req.user.user_id;
		req.body.updated_by = req.user.user_id;
		let notification = new Notification(req.body)
		return notification.save()
			.then(function (result, error) {
				if (result) {
					res.status(200).send({ type: 'success', message: "Notification data added successfully", data: result })
				} else {
					res.status(200).send({ type: 'error', message: error.message })
				}
			})
			.catch(error => res.status(200).send({ type: 'error', message: error.message }));
	}

	/**** Get List Of User Notifications **************/
	async listNotification(req, res) {
		var query = {}; var condition_arr = [{ receiver: req.user.user_id }];
		if (condition_arr.length === 1) {
			query = condition_arr[0]
		} else if (condition_arr.length > 1) {
			query = { $and: condition_arr }
		}
		var populateQuery = [{ path: 'receiver', select: 'firstname lastname mango_id' }, { path: 'created_by', select: 'firstname lastname  mango_id' }];
		var options = { select: 'message created_at', sort: { _id: -1 }, populate: populateQuery, page: Number(req.query.page), limit: Number(req.query.limit) };
		return Notification.paginate(query, options)
			.then(async (result) => {
				await Notification.updateMany({ receiver: req.user.user_id }, { is_read: true, updated_by: req.user.user_id });
				res.status(200).send({ type: 'success', message: "List of notification get successfully.", data: result })
			})
			.catch(error => res.status(200).send({ type: 'error', message: error.message }));

	}

	/******* Notification Count *************/
	async countNotification(req, res) {
		try {
			const numberOfNotification = await Notification.countDocuments({ receiver: req.user.user_id, is_read: false });
			return res.status(200).send({ type: 'success', message: "Notification count get successfully.", count: numberOfNotification });
		} catch (err) {
			return res.status(200).send({ type: 'error', message: 'Some error occured, please try later.' });
		}
	}

	/******* Notification Delete *************/
	async deleteNotification(req, res) {
		try {
			var numberOfNotificationDel;
			if (req.body.notification_id === undefined || req.body.notification_id === '') {
				numberOfNotificationDel = await Notification.deleteMany({ receiver: req.user.user_id });
			} else {
				numberOfNotificationDel = await Notification.deleteOne({ receiver: req.user.user_id, _id: req.body.notification_id });
			}
			if (numberOfNotificationDel.deletedCount == 0) {
				return res.status(200).send({ type: 'success', message: "Notification does not exist anymore.",});
			}
			return res.status(200).send({ type: 'success', message: "Notification deleted successfully."});
		} catch (err) {
			return res.status(200).send({ type: 'error', message: 'Some error occured, please try later.' });
		}
	}
}