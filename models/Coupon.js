var mongoose = require('mongoose')
	, Schema = mongoose.Schema;
var mongoosePaginate = require('mongoose-paginate');

const CouponSchema = new Schema({
	title: { type: String, default: '' },
	description: { type: String, default: '' },
	code: { type: String, default: '' },
	discount_type: { type: Number, default: 1 }, //1=Percentage,2=Fixed
	value: { type: Number, default: 0 },
	quantity: { type: Number, default: 1 },
	per_user: { type: Number, default: 1 },
	start_date: { type: Date, default: Date.now },
	end_date: { type: Date, default: Date.now },
	number_of_user_used:{ type: Number, default: 0 },
	status: { type: Number, default: 1 },//0=Inactive,1=Active,2=Expired
	created_by: { type: Schema.Types.ObjectId, ref: 'User' },
	updated_by: { type: Schema.Types.ObjectId, ref: 'User' },
	created_at: { type: Date, default: Date.now },
	updated_at: { type: Date, default: Date.now },
});

// Sets the created_at parameter equal to the current time
CouponSchema.pre('save', function (next) {
	now = new Date();
	this.updated_at = now;
	if (!this.created_at) {
		this.created_at = now
	}
	next();
});

CouponSchema.plugin(mongoosePaginate);
module.exports = mongoose.model('Coupon', CouponSchema);