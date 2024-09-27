var mongoose = require('mongoose')
	, Schema = mongoose.Schema;
var mongoosePaginate = require('mongoose-paginate');

const DiscussionAnswerSchema = new Schema({
	discussion_id: { type: Schema.Types.ObjectId, ref: 'Discussion', default: null },
	answer: {
		type: String,
		get: function (data) {
			try {
				return JSON.parse(data);
			} catch (err) {
				return data;
			}
		},
		set: function (data) {
			return JSON.stringify(data);
		},
		default: ''
	},
	answer_text: { type: String, default: '' },
	answer_type: { type: String, default: '' },
	bucket_name: { type: String, default: null },
	reported_count: { type: Number, default: 0 },
	status: { type: Number, default: 0 },
	last_reported_time: { type: Date, default: null },
	created_by: { type: Schema.Types.ObjectId, ref: 'User', default: null },
	updated_by: { type: Schema.Types.ObjectId, ref: 'User', default: null },
	created_at: { type: Date, default: Date.now },
	updated_at: { type: Date, default: Date.now },

},{
	toJSON: { virtuals: true },
	toObject: { virtuals: true }
});

// Sets the created_at parameter equal to the current time
DiscussionAnswerSchema.pre('save', function (next) {
	now = new Date();
	this.updated_at = now;
	if (!this.created_at) {
		this.created_at = now
	}
	next();
});

DiscussionAnswerSchema.virtual('aws_path').get(function () {
	var bucket_name = this.bucket_name !== null ? this.bucket_name : process.env.AWS_S3_BUCKET_NAME;
	return 'https://' + bucket_name + '.s3.amazonaws.com/';
});

DiscussionAnswerSchema.plugin(mongoosePaginate);
module.exports = mongoose.model('DiscussionAnswer', DiscussionAnswerSchema);