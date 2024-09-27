var mongoose = require('mongoose'), Schema = mongoose.Schema;
var mongoosePaginate = require('mongoose-paginate');

const NotificationSchema = new Schema({
	receiver: { type: Schema.Types.ObjectId, ref: 'User', default: null },
	message: { type: String, default: '' },
	is_read: { type: Boolean, default: false },
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
NotificationSchema.pre('save', function (next) {
	now = new Date();
	this.updated_at = now;
	if (!this.created_at) {
		this.created_at = now
	}
	next();
});


NotificationSchema.plugin(mongoosePaginate);
module.exports = mongoose.model('Notification', NotificationSchema);