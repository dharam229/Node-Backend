var mongoose = require('mongoose'), Schema = mongoose.Schema;
var mongoosePaginate = require('mongoose-paginate');

const UserStorySchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref:'User',default:null },
    title: { type: String, default: null },
    description: { type: String, default: null },
    hash_tag: [{ type: String, default: null }],
	story_file: [{type: Schema.Types.ObjectId, ref: 'UserStoryFile', default: null}],
    status: { type: Number, default: 1 },
    created_by: { type: Schema.Types.ObjectId, ref: 'User', default: null },
	updated_by: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
},{
	toJSON: { virtuals: true },
	toObject: { virtuals: true }
});


// Sets the created_at parameter equal to the current time
UserStorySchema.pre('save', function (next) {
	now = new Date();
	this.updated_at = now;
	if (!this.created_at) {
		this.created_at = now
	}
	next();
});

UserStorySchema.virtual('display_image').get(function () {
	var image_data = this.story_file.find(function fn(file) {
			return Number(file.type) === 1;
		})
	if(image_data){	
		return image_data.aws_path + image_data.path; 
	}	
});

UserStorySchema.virtual('display_hash').get(function () {
	if(this.hash_tag !== null){
		var hash = this.hash_tag.map((item) => '#'+item)
		return hash.join(', ')
	}	
});

UserStorySchema.plugin(mongoosePaginate);
module.exports = mongoose.model('UserStory', UserStorySchema);