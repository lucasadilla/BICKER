// models/Report.js
import mongoose from 'mongoose';

const ReportSchema = new mongoose.Schema({
    targetId: { type: String, required: true },
    targetType: { type: String, required: true },
    reporter: { type: String, required: true },
    reason: { type: String, required: true },
    status: { type: String, enum: ['pending', 'resolved'], default: 'pending' }
}, { timestamps: true });

export default mongoose.models.Report || mongoose.model('Report', ReportSchema);
