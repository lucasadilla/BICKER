// models/Deliberate.js
import mongoose from 'mongoose';

const DeliberateSchema = new mongoose.Schema(
    {
        instigateText: {
            type: String,
            required: true,
            maxlength: 200,
        },
        debateText: {
            type: String,
            required: true,
            maxlength: 200,
        },
        votesRed: {
            type: Number,
            default: 0,
        },
        votesBlue: {
            type: Number,
            default: 0,
        },
        createdBy: {
            type: String,
            required: true
        },
        votedBy: [{
            userId: String,
            vote: {
                type: String,
                enum: ['red', 'blue']
            }
        }]
    },
    { timestamps: true }
);

export default mongoose.models.Deliberate || mongoose.model('Deliberate', DeliberateSchema);
