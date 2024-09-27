var mongoose = require('mongoose')
	, Schema = mongoose.Schema;
var mongoosePaginate = require('mongoose-paginate');

const PlanSchema = new Schema({
	plan_id: { type: String, default: '' },
	active: { type: Boolean, default: true },
	currency: { type: String, default: 'usd' },
	name: { type: String, default: '' },
	description: { type: String, default: '' },
	product: { type: String, default: '' },
	type: { type: String, default: '' },
	recurring: { type: String, default: '' },
	unit_amount: { type: Number, default: 0.00 },
	status: { type: Number, default: 1 },
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
PlanSchema.pre('save', function (next) {
	now = new Date();
	this.updated_at = now;
	if (!this.created_at) {
		this.created_at = now
	}
	next();
});

PlanSchema.plugin(mongoosePaginate);
module.exports = mongoose.model('Plan', PlanSchema);