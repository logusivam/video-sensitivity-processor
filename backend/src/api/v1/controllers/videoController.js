import Video from '../../../models/Video.js';
import ApiUsage from '../../../models/ApiUsage.js';
import { processVideoWorker } from '../../../services/videoService.js';
import supabase from '../../../config/supabase.js'; 
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';

// Helper to check duration before processing (with error handling)
const getVideoDuration = (filePath) => {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(filePath, (err, metadata) => {
            if (err) {
                console.error("FFProbe Error:", err.message);
                resolve(0); // Resolve to 0 instead of crashing if ffprobe fails
            } else {
                resolve(metadata.format.duration || 0);
            }
        });
    });
};

// Helper function to attach signed thumbnail URLs
const attachThumbnails = async (videos) => {
    return await Promise.all(videos.map(async (v) => {
        const videoObj = v.toObject();
        if (videoObj.thumbnailPath) {
            const { data } = await supabase.storage.from('thumbnails').createSignedUrl(videoObj.thumbnailPath, 3600);
            videoObj.thumbnailUrl = data?.signedUrl || null;
        }
        return videoObj;
    }));
};

export const uploadVideo = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file provided' });

        // 1. Check File Size (Max 50MB) - Fallback check
        if (req.file.size > 50 * 1024 * 1024) {
            fs.unlinkSync(req.file.path); // Delete temp file!
            return res.status(400).json({ message: 'File exceeds 50MB limit' });
        }

        // 2. Check Daily Limit (Max 5 per day per user)
        const today = new Date().toISOString().split('T')[0];
        let usage = await ApiUsage.findOne({ userId: req.user._id, date: today });
        
        if (usage && usage.count >= 5) {
            fs.unlinkSync(req.file.path); // Delete temp file!
            return res.status(429).json({ message: 'Daily limit reached. You can only analyze 5 videos per 24 hours.' });
        }

        // 3. Check Duration (Max 60 Seconds)
        const duration = await getVideoDuration(req.file.path);
        if (duration > 60) {
            fs.unlinkSync(req.file.path); // Delete temp file!
            return res.status(400).json({ message: 'Video exceeds maximum duration of 60 seconds.' });
        }

        // Increment Usage
        if (usage) {
            usage.count += 1;
            await usage.save();
        } else {
            await ApiUsage.create({ userId: req.user._id, date: today, count: 1 });
        }

        const { title, isShared } = req.body;
        const uploaderId = req.user._id.toString(); 
        const organizationId = req.user.organizationId._id ? req.user.organizationId._id.toString() : req.user.organizationId.toString();

        const video = await Video.create({
            organizationId, uploaderId,
            title: title || req.file.originalname,
            originalFilename: req.file.originalname,
            sizeBytes: req.file.size,
            isShared: isShared === 'true'
        });

        processVideoWorker(video._id, req.file.path, uploaderId, organizationId);
        res.status(202).json({ message: 'Upload received', video });

    } catch (error) {
        console.error("UPLOAD ERROR:", error);
        // Failsafe: Clean up the file if the DB crashes
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ message: 'Failed to start upload', error: error.message });
    }
};

export const getMyVideos = async (req, res) => {
    try {
        const videos = await Video.find({ uploaderId: req.user._id }).sort({ createdAt: -1 });
        const videosWithThumbs = await attachThumbnails(videos);
        res.status(200).json({ videos: videosWithThumbs });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching videos' });
    }
};

export const getOrgVideos = async (req, res) => {
    try {
        const videos = await Video.find({ organizationId: req.user.organizationId._id, isShared: true }).sort({ createdAt: -1 });
        const videosWithThumbs = await attachThumbnails(videos);
        res.status(200).json({ videos: videosWithThumbs });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching organization videos' });
    }
};

export const getPlayUrl = async (req, res) => {
  try {
    const { id } = req.params;
    const video = await Video.findById(id);

    if (!video) return res.status(404).json({ message: "Video not found" });

    // Admins CAN play flagged videos. Viewers/Editors CANNOT.
    if (video.safetyStatus === 'flagged' && req.user.role.toLowerCase() !== 'admin') {
      return res.status(403).json({ message: "This video has been flagged for violating safety policies and cannot be played." });
    }

    const { data, error } = await supabase.storage.from('videos').createSignedUrl(video.storagePath, 3600);
    if (error) throw error;

    // Send a warning flag if an admin is playing a flagged video
    const adminWarning = video.safetyStatus === 'flagged' 
        ? "Warning: You are viewing a flagged video." : null;

    res.status(200).json({ playUrl: data.signedUrl, title: video.title, warning: adminWarning });
  } catch (error) {
    res.status(500).json({ message: 'Playback generation failed' });
  }
};

export const deleteVideo = async (req, res) => {
    try {
        if (req.user.role.toLowerCase() !== 'admin') {
            return res.status(403).json({ message: 'Only administrators can delete videos.' });
        }

        const video = await Video.findById(req.params.id);
        if (!video) return res.status(404).json({ message: 'Video not found' });

        if (video.storagePath) await supabase.storage.from('videos').remove([video.storagePath]);
        if (video.thumbnailPath) await supabase.storage.from('thumbnails').remove([video.thumbnailPath]);

        await Video.findByIdAndDelete(req.params.id);

        res.status(200).json({ message: 'Video deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting video', error: error.message });
    }
};