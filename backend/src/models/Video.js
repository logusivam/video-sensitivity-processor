import mongoose from 'mongoose';
import Counter from './Counter.js';

const videoSchema = new mongoose.Schema({
    _id: { type: String }, // VID0000001
    // 📌 CHANGE THESE TWO LINES TO STRING
    organizationId: { type: String, required: true }, 
    uploaderId: { type: String, required: true },
    title: { type: String, required: true },
    originalFilename: { type: String, required: true },
    storagePath: { type: String },    
    thumbnailPath: { type: String }, // 📌 Added for Thumbnail
    processingStatus: { 
        type: String, 
        enum: ['pending', 'processing', 'completed', 'failed'], 
        default: 'pending' 
    },
    safetyStatus: { 
        type: String, 
        enum: ['pending', 'safe', 'flagged'], 
        default: 'pending' 
    },
    sizeBytes: { type: Number },
    durationSeconds: { type: Number },
    isShared: { type: Boolean, default: true }
}, { timestamps: true });

// Pre-save hook remains the same...
videoSchema.pre('save', async function (next) {
    if (this.isNew) {
        const counter = await Counter.findByIdAndUpdate(
            { _id: 'videoId' },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );
        this._id = `VID${counter.seq.toString().padStart(7, '0')}`;
    }
    next();
});

export default mongoose.model('Video', videoSchema);