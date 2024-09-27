var mongoose = require('mongoose'), Schema = mongoose.Schema;
var mongoosePaginate = require('mongoose-paginate');

const ChatSchema = new Schema({
    name: { type: String, default: '' },
    users: [{ type: Schema.Types.ObjectId, ref: 'User', default: null }], 
    chat_type: { type: Number, default: 1 }, // 1 = Private chat 2 = Group Chat
    status: { type: Number, default: 1 }, // '1' For Active Group And 'O' For Blocked Group
    created_by: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    updated_by: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Sets the created_at parameter equal to the current time
ChatSchema.pre('save', function (next) {
    now = new Date();
    this.updated_at = now;
    if (!this.created_at) {
        this.created_at = now
    }
    next();
});


ChatSchema.plugin(mongoosePaginate);  
module.exports = mongoose.model('Chat', ChatSchema);