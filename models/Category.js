var mongoose = require('mongoose')
, Schema = mongoose.Schema;
var mongoosePaginate = require('mongoose-paginate');

const CategorySchema = new Schema({
								name: { type: String, default: '' },
								description: { type: String, default: '' },
								category_id: { type: Schema.Types.ObjectId, ref: 'Category', default: null },
								category_image: { type: String, default: null },
								active_products: { type: Number, default: 0 },
								status: { type: Number, default: 1 },
								created_by: { type: Schema.Types.ObjectId, ref: 'User' },
								updated_by: { type: Schema.Types.ObjectId, ref: 'User' },
								created_at: { type: Date, default: Date.now },
								updated_at: { type: Date, default: Date.now },
						});
						
// Sets the created_at parameter equal to the current time
CategorySchema.pre('save', function(next){
    now = new Date();
    this.updated_at = now;
    if(!this.created_at) {
        this.created_at = now
    }
    next();
});
						
CategorySchema.plugin(mongoosePaginate);						
module.exports = mongoose.model('Category', CategorySchema);