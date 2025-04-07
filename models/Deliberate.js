// models/Deliberate.js
import mongoose from 'mongoose';

const DeliberateSchema = new mongoose.Schema({
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
        default: 0
    },
    votesBlue: {
        type: Number,
        default: 0
    },
    votedBy: [{
        userId: String,
        vote: String,
        timestamp: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

// Remove any existing documents that might have validation issues
DeliberateSchema.pre('save', function(next) {
    if (!this.votedBy) {
        this.votedBy = [];
    }
    next();
});

export default mongoose.models.Deliberate || mongoose.model('Deliberate', DeliberateSchema);
