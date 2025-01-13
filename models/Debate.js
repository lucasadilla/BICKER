import mongoose from 'mongoose';

const DebateSchema = new mongoose.Schema({
    instigateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Instigate', required: true },
    debateText: { type: String, required: true, maxlength: 200 },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Debate || mongoose.model('Debate', DebateSchema);
