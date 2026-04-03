import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import Video from '../models/Video.js';
import { getIO } from '../config/socket.js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// 📌 Sensitive Keyword Dictionary
const SENSITIVE_KEYWORDS = [
    'confidential', 'internal use only', 'ssn', 'social security', 
    'password', 'credit card', 'fuck', 'shit', 'proprietary'
];

export const processVideoWorker = async (videoId, inputPath, uploaderId, organizationId) => {
    const io = getIO();
    const room = `org_${organizationId}`;
    const outputPath = path.resolve(`uploads/temp/processed_${videoId}.mp4`);
    const thumbnailName = `thumb_${videoId}.png`;
    const tempThumbPath = path.resolve(`uploads/temp/${thumbnailName}`);

    try {
        io.to(room).emit('processing_progress', { videoId, progress: 10, statusMessage: 'Extracting Metadata & Thumbnail...' });

        // 1. Get Exact Duration
        const metadata = await new Promise((resolve, reject) => {
            ffmpeg.ffprobe(inputPath, (err, metadata) => {
                if (err) reject(err);
                else resolve(metadata);
            });
        });
        const durationSeconds = Math.floor(metadata.format.duration || 0);

        // 2. Extract Thumbnail at 1-second mark
        await new Promise((resolve, reject) => {
            ffmpeg(inputPath)
                .screenshots({
                    timestamps: ['00:00:01.000'],
                    filename: thumbnailName,
                    folder: path.resolve('uploads/temp'),
                    size: '640x360'
                })
                .on('end', resolve)
                .on('error', reject);
        });

        // 3. Optimize Video (FastStart for Netflix-like scrubbing)
        await new Promise((resolve, reject) => {
            ffmpeg(inputPath)
                .outputOptions(['-movflags +faststart', '-c:v libx264', '-preset fast'])
                .on('progress', (p) => {
                    io.to(room).emit('processing_progress', { 
                        videoId, progress: Math.floor(p.percent || 0), statusMessage: 'Optimizing for Streaming...' 
                    });
                })
                .on('error', reject)
                .on('end', resolve)
                .save(outputPath);
        });

        io.to(room).emit('processing_progress', { videoId, progress: 90, statusMessage: 'Analyzing Content...' });

        // 4. Keyword Analysis Engine (UPDATED FOR ACCURATE TESTING)
        // Fetch the video record to get the actual title the user typed in
        const videoRecord = await Video.findById(videoId);
        const actualTitle = videoRecord ? videoRecord.title : '';

        // We simulate a transcript, but we prepend your ACTUAL title to it
        const mockTranscript = "Hello team, welcome to the standard meeting."; 
        const textToAnalyze = `${actualTitle} ${mockTranscript}`.toLowerCase();
        
        // Check if ANY of our sensitive keywords exist in the title or the transcript
        const isFlagged = SENSITIVE_KEYWORDS.some(keyword => textToAnalyze.includes(keyword.toLowerCase()));
        const safetyStatus = isFlagged ? 'flagged' : 'safe';

        io.to(room).emit('processing_progress', { videoId, progress: 95, statusMessage: 'Uploading to Cloud...' });

        // 5. Upload Video and Thumbnail to Supabase
        const storagePath = `${organizationId}/${videoId}.mp4`;
        const thumbStoragePath = `${organizationId}/${videoId}.png`;

        await supabase.storage.from('videos').upload(storagePath, fs.readFileSync(outputPath), { contentType: 'video/mp4', upsert: true });
        await supabase.storage.from('thumbnails').upload(thumbStoragePath, fs.readFileSync(tempThumbPath), { contentType: 'image/png', upsert: true });

        // 6. Update DB
        const sizeBytes = fs.statSync(outputPath).size;
        await Video.findByIdAndUpdate(videoId, {
            storagePath,
            thumbnailPath: thumbStoragePath,
            durationSeconds,
            sizeBytes,
            processingStatus: 'completed',
            safetyStatus
        });

        // 7. Cleanup & Notify
        fs.unlinkSync(inputPath);
        fs.unlinkSync(outputPath);
        fs.unlinkSync(tempThumbPath);
        
        io.to(room).emit('processing_completed', { videoId });

    } catch (err) {
        console.error("❌ WORKER ERROR:", err);
        await Video.findByIdAndUpdate(videoId, { processingStatus: 'failed' });
        io.to(room).emit('processing_completed', { videoId }); // triggers refresh to show failed state
    }
};