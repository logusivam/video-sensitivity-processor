import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import FormData from 'form-data';
import { createClient } from '@supabase/supabase-js';
import Video from '../models/Video.js';
import { getIO } from '../config/socket.js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// 📌 The Queue System
const processingQueue = [];
let isProcessing = false;

// ------------------------------------------------------------------
// API: Sightengine SINGLE FRAME Analyzer (Free Plan Compatible)
// ------------------------------------------------------------------
const analyzeFrameWithSightengine = async (imagePath) => {
    try {
        const data = new FormData();
        data.append('media', fs.createReadStream(imagePath));
        data.append('models', 'nudity,wad,gore'); 
        data.append('api_user', process.env.SIGHTENGINE_API_USER);
        data.append('api_secret', process.env.SIGHTENGINE_API_SECRET);

        const response = await axios({
            method: 'post',
            url: 'https://api.sightengine.com/1.0/check.json',
            data: data,
            headers: {
                ...data.getHeaders(),
                'Connection': 'close'
            },
            timeout: 15000
        });

        const result = response.data;
        let isFlagged = false;
        let flaggedReason = '';

        if (result.nudity && result.nudity.safe <= 0.5) { isFlagged = true; flaggedReason += 'Nudity '; }
        if (result.weapon > 0.5 || result.alcohol > 0.5 || result.drugs > 0.5) { isFlagged = true; flaggedReason += 'Weapons/Contraband '; }
        if (result.gore && result.gore.prob > 0.5) { isFlagged = true; flaggedReason += 'Violence/Gore '; }

        return { isFlagged, reason: flaggedReason.trim() };
    } catch (error) {
        console.error("Sightengine API Error:", error.response?.data || error.message);
        return { isFlagged: false, reason: 'API_ERROR' }; 
    }
};

// ------------------------------------------------------------------
// The Worker Task
// ------------------------------------------------------------------
const executeVideoTask = async ({ videoId, inputPath, uploaderId, organizationId }) => {
    const io = getIO();
    const room = `org_${organizationId}`;
    const outputPath = path.resolve(`uploads/temp/processed_${videoId}.mp4`);
    
    const getFramePath = (index) => path.resolve(`uploads/temp/frame_${index}_${videoId}.png`);

    let safetyStatus = 'safe';
    let finalThumbnailPath = null;

    try {
        io.to(room).emit('processing_progress', { videoId, progress: 10, statusMessage: 'Extracting Metadata & Keyframes...' });

        // 1. Get Exact Duration
        const durationSeconds = await new Promise((resolve, reject) => {
            ffmpeg.ffprobe(inputPath, (err, metadata) => {
                if (err) reject(err);
                else resolve(Math.floor(metadata.format.duration || 0));
            });
        });

        // 2. Multi-Frame Extraction (25%, 50%, and 75% marks)
        await new Promise((resolve, reject) => {
            ffmpeg(inputPath)
                .screenshots({
                    timestamps: ['25%', '50%', '75%'], 
                    filename: `frame_%i_${videoId}.png`, // Generates frame_1, frame_2, frame_3
                    folder: path.resolve('uploads/temp'),
                    size: '640x360'
                })
                .on('end', resolve)
                .on('error', reject);
        });

        io.to(room).emit('processing_progress', { videoId, progress: 25, statusMessage: 'Running Multi-Frame Safety Analysis...' });

        // 3. Concurrent Sightengine Analysis (Image API - Safe for Free Plan)
        const framePaths = [getFramePath(1), getFramePath(2), getFramePath(3)];
        const validFrames = framePaths.filter(fp => fs.existsSync(fp));
        
        if (validFrames.length > 0) {
            const analysisPromises = validFrames.map(fp => analyzeFrameWithSightengine(fp));
            const analysisResults = await Promise.all(analysisPromises);

            // If ANY of the 3 frames triggered a flag, the entire video is flagged
            const flaggedResult = analysisResults.find(result => result.isFlagged);
            
            if (flaggedResult) {
                console.log(`🚨 Video ${videoId} flagged by Image API. Reason: ${flaggedResult.reason}`);
                safetyStatus = 'flagged';
            }

            // Use the 50% frame as the UI thumbnail
            finalThumbnailPath = validFrames.length >= 2 ? validFrames[1] : validFrames[0];
        } else {
            console.warn(`⚠️ No frames could be extracted for video ${videoId}`);
        }

        io.to(room).emit('processing_progress', { videoId, progress: 50, statusMessage: 'Optimizing for Web Streaming...' });

        // 4. Optimize Video (FastStart)
        await new Promise((resolve, reject) => {
            ffmpeg(inputPath)
                .outputOptions(['-movflags +faststart', '-c:v libx264', '-preset fast'])
                .on('progress', (p) => {
                    const adjustedProgress = 50 + Math.floor((p.percent || 0) * 0.4);
                    io.to(room).emit('processing_progress', { videoId, progress: adjustedProgress, statusMessage: 'Optimizing for Web Streaming...' });
                })
                .on('error', reject)
                .on('end', resolve)
                .save(outputPath);
        });

        io.to(room).emit('processing_progress', { videoId, progress: 95, statusMessage: 'Uploading to Secure Vault...' });

        // 5. Upload Video and Thumbnail to Supabase
        const storagePath = `${organizationId}/${videoId}.mp4`;
        const thumbStoragePath = `${organizationId}/${videoId}.png`;
        
        await supabase.storage.from('videos').upload(storagePath, fs.readFileSync(outputPath), { contentType: 'video/mp4', upsert: true });
        
        if (finalThumbnailPath && fs.existsSync(finalThumbnailPath)) {
            await supabase.storage.from('thumbnails').upload(thumbStoragePath, fs.readFileSync(finalThumbnailPath), { contentType: 'image/png', upsert: true });
        }

        // 6. Update DB
        await Video.findByIdAndUpdate(videoId, {
            storagePath,
            thumbnailPath: (finalThumbnailPath && fs.existsSync(finalThumbnailPath)) ? thumbStoragePath : null,
            durationSeconds,
            sizeBytes: fs.statSync(outputPath).size,
            processingStatus: 'completed',
            safetyStatus
        });

        // 7. Dynamic Cleanup
        fs.unlinkSync(inputPath);
        fs.unlinkSync(outputPath);
        [1, 2, 3].forEach(i => {
            const fp = getFramePath(i);
            if (fs.existsSync(fp)) fs.unlinkSync(fp);
        });
        
        io.to(room).emit('processing_completed', { videoId });

    } catch (err) {
        console.error("❌ WORKER ERROR:", err);
        await Video.findByIdAndUpdate(videoId, { processingStatus: 'failed' });
        io.to(room).emit('processing_completed', { videoId }); 
        
        // Failsafe Cleanup
        if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
        if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
        [1, 2, 3].forEach(i => {
            const fp = getFramePath(i);
            if (fs.existsSync(fp)) fs.unlinkSync(fp);
        });
    }
};

// ------------------------------------------------------------------
// Queue Manager
// ------------------------------------------------------------------
const processNextInQueue = async () => {
    if (isProcessing || processingQueue.length === 0) return;
    
    isProcessing = true; 
    
    while (processingQueue.length > 0) {
        const currentTask = processingQueue.shift(); 
        try {
            await executeVideoTask(currentTask);
        } catch (error) {
            console.error(`Queue Task Failed for video ${currentTask.videoId}:`, error);
        }
    }
    
    isProcessing = false; 
};

// ------------------------------------------------------------------
// Exported Worker Initiator
// ------------------------------------------------------------------
export const processVideoWorker = (videoId, inputPath, uploaderId, organizationId) => {
    processingQueue.push({ videoId, inputPath, uploaderId, organizationId });
    
    const io = getIO();
    io.to(`org_${organizationId}`).emit('processing_progress', { 
        videoId, 
        progress: 0, 
        statusMessage: 'Queued for processing...' 
    });

    processNextInQueue();
};