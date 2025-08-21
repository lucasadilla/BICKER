// models/Debate.js
import mongoose from 'mongoose';

const DebateSchema = new mongoose.Schema({
    instigateText: {
        type: String,
        maxlength: 200,
    },
    instigateVoiceNote: {
        type: String,
    },
    debateText: {
        type: String,
        maxlength: 200,
    },
    debateVoiceNote: {
        type: String,
    },
    createdBy: {
        type: String,
        required: true
    },
    instigatedBy: {
        type: String,
        default: 'anonymous'
    }
}, { timestamps: true });

export default mongoose.models.Debate || mongoose.model('Debate', DebateSchema);
