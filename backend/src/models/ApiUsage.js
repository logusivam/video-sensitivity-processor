import mongoose from 'mongoose';

const apiUsageSchema = new mongoose.Schema({
    userId: { type: String, ref: 'User', required: true },
    date: { type: String, required: true }, // Format: YYYY-MM-DD
    count: { type: Number, default: 1 }
});

export default mongoose.model('ApiUsage', apiUsageSchema);