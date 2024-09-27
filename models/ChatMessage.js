var mongoose = require('mongoose'), Schema = mongoose.Schema;
var mongoosePaginate = require('mongoose-paginate');

const ChatMessageSchema = new Schema({
    chat_id: { type: Schema.Types.ObjectId, ref: 'Chat', default: null }, 
    sender: { type: Schema.Types.ObjectId, ref: 'User', default: null }, 
    users_read_at: [{ type: Schema.Types.ObjectId, ref: 'User', default: null }], 
    message: { type: String, default: null },
    files: { type: String, default: null },
    created_by: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    updated_by: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Sets the created_at parameter equal to the current time
ChatMessageSchema.pre('save', function (next) {
    now = new Date();
    this.updated_at = now;
    if (!this.created_at) {
        this.created_at = now
    }
    next();
});

ChatMessageSchema.virtual('username').get(function () {
	return this.sender.fullname;
});


ChatMessageSchema.plugin(mongoosePaginate);  
module.exports = mongoose.model('ChatMessage', ChatMessageSchema);