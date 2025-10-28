// models/Notification.js
import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    debateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Deliberate', default: null },
    type: {
        type: String,
        enum: ['response', 'vote', 'reaction', 'supporter'],
        default: 'response'
    },
    link: {
        type: String,
        default: null
    }
}, { timestamps: true });

export default mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);
