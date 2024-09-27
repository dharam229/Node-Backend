var mongoose = require('mongoose')
, Schema = mongoose.Schema;

const TicketFileSchema = new Schema({
    ticket_id: { type: Schema.Types.ObjectId, ref:'Ticket' },
    name: { type: String, default: null },
    path: { type: String, default: null },
    mime: { type: String, default: null },
    bucket_name: { type: String, default: null },
    type: { type: Number, default: 1 },//1=Image,2=Docs
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
},{
	toJSON: { virtuals: true },
	toObject: { virtuals: true }
});

TicketFileSchema.virtual('aws_path').get(function () {
	var bucket_name = this.bucket_name !== null ? this.bucket_name : process.env.AWS_S3_BUCKET_NAME;
	return 'https://' + bucket_name + '.s3.amazonaws.com/';
});

module.exports = mongoose.model('TicketFile', TicketFileSchema);