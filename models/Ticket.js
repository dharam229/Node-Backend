var mongoose = require('mongoose'), Schema = mongoose.Schema;
var mongoosePaginate = require('mongoose-paginate');

const TicketSchema = new Schema({
    name: { type: String, default: '' },
    ticket_date: { type: Date, default: Date.now },
    status: { type: Number, default: 1 }, // 1 = New 2 = Resolved 
    issue_type: {type: Number, default: 1},
    ticket_file: [{ type: Schema.Types.ObjectId, ref: 'TicketFile', default: null }],
    complaint: { type : String, default : null},   
    add_notes: { type : String, default : null},   
    created_by: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    updated_by: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Sets the created_at parameter equal to the current time
TicketSchema.pre('save', function (next) {
    now = new Date();
    this.updated_at = now;
    if (!this.created_at) {
        this.created_at = now
    }
    next();
});


TicketSchema.plugin(mongoosePaginate);  
module.exports = mongoose.model('Ticket', TicketSchema);