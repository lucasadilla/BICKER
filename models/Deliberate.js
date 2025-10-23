// models/Deliberate.js
import mongoose from 'mongoose';

const ReactionCountsSchema = new mongoose.Schema(
    {
        red: {
            type: Map,
            of: Number,
            default: () => new Map()
        },
        blue: {
            type: Map,
            of: Number,
            default: () => new Map()
        }
    },
    { _id: false }
);

const ReactionBySchema = new mongoose.Schema(
    {
        userId: String,
        side: {
            type: String,
            enum: ['red', 'blue']
        },
        emoji: String,
        timestamp: { type: Date, default: Date.now }
    },
    { _id: false }
);

const DeliberateSchema = new mongoose.Schema(
    {
        instigateText: {
            type: String,
            maxlength: 200
        },
        debateText: {
            type: String,
            maxlength: 200
        },
        createdBy: {
            type: String,
            default: 'anonymous'
        },
        instigatedBy: {
            type: String,
            default: 'anonymous'
        },
        votesRed: {
            type: Number,
            default: 0
        },
        votesBlue: {
            type: Number,
            default: 0
        },
        votedBy: [
            {
                userId: String,
                vote: String,
                timestamp: { type: Date, default: Date.now }
            }
        ],
        reactions: {
            type: ReactionCountsSchema,
            default: () => ({ red: new Map(), blue: new Map() })
        },
        reactionsBy: {
            type: [ReactionBySchema],
            default: []
        }
    },
    { timestamps: true }
);

// Remove any existing documents that might have validation issues
DeliberateSchema.pre('save', function(next) {
    if (!this.votedBy) {
        this.votedBy = [];
    }

    if (!this.reactions) {
        this.reactions = { red: new Map(), blue: new Map() };
    }

    if (!this.reactions.red) {
        this.reactions.red = new Map();
    }

    if (!this.reactions.blue) {
        this.reactions.blue = new Map();
    }

    if (!this.reactionsBy) {
        this.reactionsBy = [];
    }

    next();
});

export default mongoose.models.Deliberate || mongoose.model('Deliberate', DeliberateSchema);
