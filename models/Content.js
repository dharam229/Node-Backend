var mongoose = require('mongoose')
, Schema = mongoose.Schema;
var mongoosePaginate = require('mongoose-paginate');

const ContentSchema = new Schema({
								name: { type: String, default: '' },
								slug: { type: String, default: '' },
								content: { type: String, default: '' },
								status: { type: Number, default: 1 },
								created_by: { type: Schema.Types.ObjectId, ref: 'User' },
								updated_by: { type: Schema.Types.ObjectId, ref: 'User' },
								created_at: { type: Date, default: Date.now },
								updated_at: { type: Date, default: Date.now },
						});
						
// Sets the created_at parameter equal to the current time
ContentSchema.pre('save', function(next){
    now = new Date();
    this.updated_at = now;
    if(!this.created_at) {
        this.created_at = now;
    }
    next();
});
					
ContentSchema.plugin(mongoosePaginate);						
module.exports = mongoose.model('Content', ContentSchema);

