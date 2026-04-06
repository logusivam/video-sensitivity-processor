import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import FormData from 'form-data';
import { createClient } from '@supabase/supabase-js';
import Video from '../models/Video.js';
import { getIO } from '../config/socket.js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// 📌 Sightengine Integration Function
const analyzeFrameWithSightengine = async (imagePath) => {
    try {
        const data = new FormData();
        data.append('media', fs.createReadStream(imagePath));
        // We check for nudity, weapons/alcohol/drugs (wad), and violence (gore)
        data.append('models', 'nudity,wad,gore'); 
        data.append('api_user', process.env.SIGHTENGINE_API_USER);
        data.append('api_secret', process.env.SIGHTENGINE_API_SECRET);

        const response = await axios({
            method: 'post',
            url: 'https://api.sightengine.com/1.0/check.json',
            data: data,
            headers: data.getHeaders()
        });

        const result = response.data;
        
        // 📌 Classification Logic based on Sightengine's Response Structure
        let isFlagged = false;
        let flaggedReason = '';

        // Check Nudity (Safe values are usually above 0.9)
        if (result.nudity && result.nudity.safe <= 0.5) {
            isFlagged = true;
            flaggedReason += 'Nudity ';
        }
        
        // Check Weapons, Alcohol, Drugs
        if (result.weapon > 0.5 || result.alcohol > 0.5 || result.drugs > 0.5) {
            isFlagged = true;
            flaggedReason += 'Weapons/Contraband ';
        }

        // Check Violence/Gore
        if (result.gore && result.gore.prob > 0.5) {
            isFlagged = true;
            flaggedReason += 'Violence/Gore ';
        }

        return { isFlagged, reason: flaggedReason.trim() };
    } catch (error) {
        console.error("Sightengine API Error:", error.response?.data || error.message);
        // Fallback to safe if API fails, or you could choose to flag it for manual review
        return { isFlagged: false, reason: 'API_ERROR' }; 
    }
};


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

        io.to(room).emit('processing_progress', { videoId, progress: 30, statusMessage: 'Analyzing Content Safety...' });

        // 3. Sightengine Safety Analysis (REAL API CALL)
        // We pass the newly generated thumbnail to Sightengine
        const analysisResult = await analyzeFrameWithSightengine(tempThumbPath);
        const safetyStatus = analysisResult.isFlagged ? 'flagged' : 'safe';

        if (analysisResult.isFlagged) {
            console.log(`Video ${videoId} flagged for: ${analysisResult.reason}`);
        }

        io.to(room).emit('processing_progress', { videoId, progress: 50, statusMessage: 'Optimizing for Streaming...' });

        // 4. Optimize Video (FastStart for Netflix-like scrubbing)
        await new Promise((resolve, reject) => {
            ffmpeg(inputPath)
                .outputOptions(['-movflags +faststart', '-c:v libx264', '-preset fast'])
                .on('progress', (p) => {
                    // Map FFmpeg progress (0-100) to our remaining 50-90% window
                    const adjustedProgress = 50 + Math.floor((p.percent || 0) * 0.4);
                    io.to(room).emit('processing_progress', { 
                        videoId, progress: adjustedProgress, statusMessage: 'Optimizing for Streaming...' 
                    });
                })
                .on('error', reject)
                .on('end', resolve)
                .save(outputPath);
        });

        io.to(room).emit('processing_progress', { videoId, progress: 95, statusMessage: 'Uploading to Cloud Storage...' });

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
        io.to(room).emit('processing_completed', { videoId }); 
        
        // Cleanup on failure
        if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
        if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
        if (fs.existsSync(tempThumbPath)) fs.unlinkSync(tempThumbPath);
    }
};