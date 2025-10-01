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
    lastActivityAt: {
        type: Date,
        default: null
    },
    badges: {
        type: [String],
        default: []
    },
    username: {
        type: String,
        default: ''
    },
    bio: {
        type: String,
        default: ''
    },
    profilePicture: {
        type: String,
        default: ''
    },
    selectedBadge: {
        type: String
    },
    colorScheme: {
        type: String,
        default: 'light'
    }
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
