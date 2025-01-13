import mongoose from 'mongoose';

const DeliberateSchema = new mongoose.Schema({
    debateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Debate', required: true },
    votesRed: { type: Number, default: 0 },
    votesBlue: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Deliberate || mongoose.model('Deliberate', DeliberateSchema);
