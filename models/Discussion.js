var mongoose = require('mongoose')
	, Schema = mongoose.Schema;
var mongoosePaginate = require('mongoose-paginate');
const { AnswerOptions } = require('../configs/constant');

const DiscussionSchema = new Schema({
	topic: { type: String, default: '' },
	answer_type: { type: String, default: '' },
	answer: [{ type: Schema.Types.ObjectId, ref: 'DiscussionAnswer', default: null }],
	end_date: { type: Date, default: null },
	status: { type: Number, default: 0 },
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
DiscussionSchema.pre('save', function (next) {
	now = new Date();
	this.updated_at = now;
	if (!this.created_at) {
		this.created_at = now
	}
	next();
});

DiscussionSchema.virtual('answer_type_name').get(function () {
	var pre_selected = this.answer_type.split(',');
	var new_array = AnswerOptions.filter(item => pre_selected.includes(item.id.toString())).map((item) => { return item.name });
	return new_array.toString().split(',').join(', ');
});

DiscussionSchema.plugin(mongoosePaginate);
module.exports = mongoose.model('Discussion', DiscussionSchema);