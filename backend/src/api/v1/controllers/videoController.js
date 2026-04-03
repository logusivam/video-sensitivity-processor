import Video from '../../../models/Video.js';
import { processVideoWorker } from '../../../services/videoService.js';
import supabase from '../../../config/supabase.js'; 

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
        if (!req.file) return res.status(400).json({ message: 'No file' });
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

    if (video.safetyStatus === 'flagged' && req.user.role.toLowerCase() !== 'admin') {
      return res.status(403).json({ message: "Access denied. Content flagged." });
    }

    const { data, error } = await supabase.storage.from('videos').createSignedUrl(video.storagePath, 3600);
    if (error) throw error;

    res.status(200).json({ playUrl: data.signedUrl, title: video.title });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 📌 NEW: Delete Video Feature
export const deleteVideo = async (req, res) => {
    try {
        if (req.user.role.toLowerCase() !== 'admin') {
            return res.status(403).json({ message: 'Only administrators can delete videos.' });
        }

        const video = await Video.findById(req.params.id);
        if (!video) return res.status(404).json({ message: 'Video not found' });

        // Delete from Supabase
        if (video.storagePath) await supabase.storage.from('videos').remove([video.storagePath]);
        if (video.thumbnailPath) await supabase.storage.from('thumbnails').remove([video.thumbnailPath]);

        // Delete from DB
        await Video.findByIdAndDelete(req.params.id);

        res.status(200).json({ message: 'Video deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting video', error: error.message });
    }
};