var mongoose = require('mongoose')
	, Schema = mongoose.Schema;
var mongoosePaginate = require('mongoose-paginate');

const DiscussionFeedbackSchema = new Schema({
	answer_id: { type: Schema.Types.ObjectId, ref: 'DiscussionAnswer', default: null },
	discussion_id: { type: Schema.Types.ObjectId, ref: 'Discussion', default: null },
	type: { type: Number, default: 1 },//1=LIke,2=Dislike,3=Report
	text: { type: String, default: '' },
	bucket_name: { type: String, default: null },
	status: { type: Number, default: 0 },
	created_by: { type: Schema.Types.ObjectId, ref: 'User', default: null },
	updated_by: { type: Schema.Types.ObjectId, ref: 'User', default: null },
	created_at: { type: Date, default: Date.now },
	updated_at: { type: Date, default: Date.now },
});

DiscussionFeedbackSchema.virtual('aws_path').get(function () {
	var bucket_name = this.bucket_name !== null ? this.bucket_name : process.env.AWS_S3_BUCKET_NAME;
	return 'https://' + bucket_name + '.s3.amazonaws.com/';
});

// Sets the created_at parameter equal to the current time
DiscussionFeedbackSchema.pre('save', function (next) {
	now = new Date();
	this.updated_at = now;
	if (!this.created_at) {
		this.created_at = now
	}
	next();
});

DiscussionFeedbackSchema.plugin(mongoosePaginate);
module.exports = mongoose.model('DiscussionFeedback', DiscussionFeedbackSchema);