// models/Debate.js
import mongoose from 'mongoose';

const DebateSchema = new mongoose.Schema({
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
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.models.Debate || mongoose.model('Debate', DebateSchema);
