var mongoose = require('mongoose')
	, Schema = mongoose.Schema;
var mongoosePaginate = require('mongoose-paginate');
const { CurrencyOptions } = require('../configs/constant');

const AdvertisementSchema = new Schema({
	title: { type: String, default: '' },
	description: { type: String, default: '' },
	price: { type: Number, default: '' },
	country: { type: String, default: '' },
	state: { type: String, default: '' },
	city: { type: String, default: '' },
	category_id: { type: Schema.Types.ObjectId, ref: 'Category', default: null },
	advertisement_file: [{ type: Schema.Types.ObjectId, ref: 'AdvertisementFile', default: null }],
	views: { type: Number, default: 0 },
	preferences: [{ type: String, default: '' }],
	specifications: [{ type: String, default: '' }],
	currency_id: { type: Number, default: 1 },
	status: { type: Number, default: 1 },//0=Inactive,1=Active,2=Sold
	created_by: { type: Schema.Types.ObjectId, ref: 'User' },
	updated_by: { type: Schema.Types.ObjectId, ref: 'User' },
	created_at: { type: Date, default: Date.now },
	updated_at: { type: Date, default: Date.now },
},{
	toJSON: { virtuals: true },
	toObject: { virtuals: true }
});

// Sets the created_at parameter equal to the current time
AdvertisementSchema.pre('save', function (next) {
	now = new Date();
	this.updated_at = now;
	if (!this.created_at) {
		this.created_at = now
	}
	next();
});

AdvertisementSchema.virtual('currency').get(function() {
	if(this.currency_id !== undefined){
		var new_array = CurrencyOptions.filter(item => {return item.id === this.currency_id});
		return new_array[0].icon;
	}
	return '$';
});

AdvertisementSchema.plugin(mongoosePaginate);
module.exports = mongoose.model('Advertisement', AdvertisementSchema);