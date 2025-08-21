// models/Instigate.js
import mongoose from 'mongoose';

const InstigateSchema = new mongoose.Schema(
    {
        text: {
            type: String,
            maxlength: 200,
        },
        voiceNote: {
            type: String,
        },
        createdBy: {
            type: String,
            default: 'anonymous',
        },
    },
    { timestamps: true } // adds createdAt, updatedAt automatically
);

export default mongoose.models.Instigate || mongoose.model('Instigate', InstigateSchema);
