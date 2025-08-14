// models/User.js
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    points: {
        type: Number,
        default: 0
    },
    streak: {
        type: Number,
        default: 0
    },
    badges: {
        type: [String],
        default: []
    },
    username: {
        type: String
    },
    bio: {
        type: String
    },
    avatar: {
        type: String
    },
    selectedBadge: {
        type: String
    }
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
