var mongoose = require('mongoose')
, Schema = mongoose.Schema;
var mongoosePaginate = require('mongoose-paginate');

const UserOtpSchema = new Schema({
								otp: { type: Number, default: '' },
								status: { type: Number, default: 0 },
								created_by: { type: Schema.Types.ObjectId, ref: 'User', default: null},
								updated_by: { type: Schema.Types.ObjectId, ref: 'User', default: null},
								created_at: { type: Date, default: Date.now },
								updated_at: { type: Date, default: Date.now },
						});

// Sets the created_at parameter equal to the current time
UserOtpSchema.pre('save', function(next){
    now = new Date();
    this.updated_at = now;
    if(!this.created_at) {
        this.created_at = now
    }
    next();
});

UserOtpSchema.plugin(mongoosePaginate);
module.exports = mongoose.model('UserOtp', UserOtpSchema);