var mongoose = require('mongoose'), Schema = mongoose.Schema;
var mongoosePaginate = require('mongoose-paginate');

const SubscriptionReportSchema = new Schema({
	subscription_id: { type: String, default: '' },
	plan_id: { type: Schema.Types.ObjectId, ref: 'Plan', default: null },
	cancel_at_period_end: { type: Boolean, default: false },
	canceled_at: { type: Number, default: null },
	cancel_at: { type: Number, default: null },
	coupon: { type: Schema.Types.ObjectId, ref: 'Coupon', default: null },
	sub_type: { type: String, default: null },
	current_period_end: { type: Number, default: null },
	current_period_start: { type: Number, default: null },
	ended_at: { type: Number, default: null },
	unit_amount: { type: Number, default: 0 },
	discount: { type: Number, default: 0 },
	net_amount: { type: Number, default: 0 },
	customer: { type: String, default: '' },
	currency: { type: String, default: 'usd' },
	default_payment_method: { type: String, default: '' },
	collection_method: { type: String, default: '' },
	stripe_status: { type: String, default: 'Active' },
	status: { type: Number, default: 0 }, // 0 =  for inactive subscription  , 1 = Active subscription
	created_by: { type: Schema.Types.ObjectId, ref: 'User', default: null },
	updated_by: { type: Schema.Types.ObjectId, ref: 'User', default: null },
	created_at: { type: Date, default: Date.now },
	updated_at: { type: Date, default: Date.now },
},
	{
		toJSON: { virtuals: true },
		toObject: { virtuals: true }
	});

// Sets the created_at parameter equal to the current time
SubscriptionReportSchema.pre('save', function (next) {
	now = new Date();
	this.updated_at = now;
	if (!this.created_at) {
		this.created_at = now
	}
	next();
});

SubscriptionReportSchema.plugin(mongoosePaginate);
module.exports = mongoose.model('SubscriptionReport', SubscriptionReportSchema);