var mongoose = require('mongoose')
, Schema = mongoose.Schema;

const UserStoryFileSchema = new Schema({
    story_id: { type: Schema.Types.ObjectId, ref:'UserStory' },
    name: { type: String, default: null },
    path: { type: String, default: null },
    mime: { type: String, default: null },
    bucket_name: { type: String, default: null },
    type: { type: Number, default: 1 },//1=Image,2=video
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
},{
	toJSON: { virtuals: true },
	toObject: { virtuals: true }
});

// Sets the created_at parameter equal to the current time
UserStoryFileSchema.pre('save', function (next) {
	now = new Date();
	this.updated_at = now;
	if (!this.created_at) {
		this.created_at = now
	}
	next();
});

UserStoryFileSchema.virtual('aws_path').get(function () {
	var bucket_name = this.bucket_name !== null ? this.bucket_name : process.env.AWS_S3_BUCKET_NAME;
	return 'https://' + bucket_name + '.s3.amazonaws.com/';
});

module.exports = mongoose.model('UserStoryFile', UserStoryFileSchema);