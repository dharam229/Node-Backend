var mongoose = require('mongoose')
	, Schema = mongoose.Schema;
var mongoosePaginate = require('mongoose-paginate');

const CountrySchema = new Schema({
	id: { type: Number, default: '' },
	name: { type: String, default: '' },
	state_id: { type: Number, default: '' },
	state_code: { type: String, default: '' },
	country_id: { type: Number, default: '' },
	country_code: { type: String, default: '' },
	country_name: { type: String, default: '' },
	state_name: { type: String, default: '' },
	state_code: { type: String, default: '' },
	latitude: { type: String, default: '' },
	longitude: { type: String, default: '' },
	status: { type: Number, default: 1 },
	created_by: { type: Schema.Types.ObjectId, ref: 'User' },
	updated_by: { type: Schema.Types.ObjectId, ref: 'User' },
	created_at: { type: Date, default: Date.now },
	updated_at: { type: Date, default: Date.now },
});

// Sets the created_at parameter equal to the current time
CountrySchema.pre('save', function (next) {
	now = new Date();
	this.updated_at = now;
	if (!this.created_at) {
		this.created_at = now
	}
	next();
});

CountrySchema.plugin(mongoosePaginate);
module.exports = mongoose.model('Country', CountrySchema);