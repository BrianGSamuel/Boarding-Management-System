const mongoose = require('mongoose');

const TicketSchema = new mongoose.Schema({
    title: {type: String,required: true,},
    description: {type: String,required: true,},
    status: {type: String,enum: ['Open', 'In Progress', 'Resolved', 'Closed'],default: 'Open',},
    category: {type: String,
                enum: ['Complaints', 'Service Requests', 'Inquiries'],
                required: true,
    },
    createdBy: {type: mongoose.Schema.Types.ObjectId,ref: 'User',required: true,},
    assignedTo: {type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null,},
    messages: [
        {
            sender: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true,
            },
            message: {
                type: String,
                required: true,
            },
            timestamp: {
                type: Date,
                default: Date.now,
            },
        },
    ],
    createdAt: { type: Date, default: Date.now,},
    updatedAt: {type: Date,default: Date.now,},
});

module.exports = mongoose.model('Ticket', TicketSchema);




