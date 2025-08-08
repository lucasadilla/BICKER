// models/Instigate.js
import mongoose from 'mongoose';

const InstigateSchema = new mongoose.Schema(
    {
        text: {
            type: String,
            required: true,
            maxlength: 200,
        },
        createdBy: {
            type: String,
            default: 'anonymous',
        },
        tags: {
            type: [String],
            default: [],
        },
    },
    { timestamps: true } // adds createdAt, updatedAt automatically
);

export default mongoose.models.Instigate || mongoose.model('Instigate', InstigateSchema);
