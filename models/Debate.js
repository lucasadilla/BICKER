// models/Debate.js
import mongoose from 'mongoose';

const DebateSchema = new mongoose.Schema({
    instigateText: {
        type: String,
        maxlength: 200,
    },
    instigateAudioUrl: {
        type: String,
    },
    debateText: {
        type: String,
        maxlength: 200,
    },
    debateAudioUrl: {
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
