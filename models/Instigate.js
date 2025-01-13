import mongoose from 'mongoose';

const InstigateSchema = new mongoose.Schema({
    text: { type: String, required: true, maxlength: 200 },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Instigate || mongoose.model('Instigate', InstigateSchema);
