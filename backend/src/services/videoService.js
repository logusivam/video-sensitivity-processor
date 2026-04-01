import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import Video from '../models/Video.js';
import { getIO } from '../config/socket.js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export const processVideoWorker = async (videoId, inputPath, uploaderId, organizationId) => {
    const io = getIO();
    const room = `org_${organizationId}`;
    const outputPath = path.resolve(`uploads/temp/processed_${videoId}.mp4`);

    try {
        // 1. Optimize for Web (FastStart)
        await new Promise((resolve, reject) => {
            ffmpeg(inputPath)
                .outputOptions(['-movflags +faststart', '-c:v libx264', '-preset fast'])
                .on('progress', (p) => {
                    io.to(room).emit('processing_progress', { 
                        videoId, progress: Math.floor(p.percent || 0), statusMessage: 'Optimizing...' 
                    });
                })
                .on('error', reject)
                .on('end', resolve)
                .save(outputPath);
        });

        // 2. Read optimized file
        const fileBuffer = fs.readFileSync(outputPath);
        const fileName = `${organizationId}/${videoId}.mp4`;

        // 3. Upload to Supabase Storage
        const { data, error: uploadError } = await supabase.storage
            .from('videos') // 📌 Ensure this bucket exists in Supabase!
            .upload(fileName, fileBuffer, {
                contentType: 'video/mp4',
                upsert: true
            });

        if (uploadError) throw uploadError;

        // 4. Final DB Update
        await Video.findByIdAndUpdate(videoId, {
            storagePath: fileName,
            processingStatus: 'completed',
            safetyStatus: Math.random() > 0.1 ? 'safe' : 'flagged' // Mock analysis
        });

        // 5. Cleanup & Notify
        fs.unlinkSync(inputPath);
        fs.unlinkSync(outputPath);
        io.to(room).emit('processing_completed', { videoId });

    } catch (err) {
        console.error("❌ WORKER ERROR:", err);
        await Video.findByIdAndUpdate(videoId, { processingStatus: 'failed' });
    }
};