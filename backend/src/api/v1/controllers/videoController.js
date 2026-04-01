import Video from '../../../models/Video.js';
import { processVideoWorker } from '../../../services/videoService.js';
import supabase from '../../../config/supabase.js'; 

export const uploadVideo = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file' });

        const { title, isShared } = req.body;
        
        // 📌 Ensure we are grabbing the string version of the IDs
        const uploaderId = req.user._id.toString(); 
        const organizationId = req.user.organizationId._id 
            ? req.user.organizationId._id.toString() 
            : req.user.organizationId.toString();

        const video = await Video.create({
            organizationId,
            uploaderId,
            title: title || req.file.originalname,
            originalFilename: req.file.originalname,
            sizeBytes: req.file.size,
            isShared: isShared === 'true'
        });

        processVideoWorker(video._id, req.file.path, uploaderId, organizationId);

        res.status(202).json({ message: 'Upload received', video });
    } catch (error) {
        console.error("UPLOAD ERROR:", error);
        res.status(500).json({ message: 'Failed to start upload', error: error.message });
    }
};

export const getMyVideos = async (req, res) => {
    try {
        // 📌 FIX: Ensure we only find videos for the current user
        const videos = await Video.find({ uploaderId: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json({ videos });
    } catch (error) {
        console.error("GET VIDEOS ERROR:", error);
        res.status(500).json({ message: 'Error fetching videos' });
    }
};

export const getOrgVideos = async (req, res) => {
    try {
        const videos = await Video.find({ 
            organizationId: req.user.organizationId._id,
            isShared: true 
        }).sort({ createdAt: -1 });
        res.status(200).json({ videos });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching organization videos' });
    }
};

export const getPlayUrl = async (req, res) => {
  try {
    const { id } = req.params;
    const video = await Video.findById(id);

    if (!video) return res.status(404).json({ message: "Video not found" });

    // Security check: Only stream if safe (or if user is Admin)
    if (video.safetyStatus === 'flagged' && req.user.role !== 'Admin') {
      return res.status(403).json({ message: "Access denied. Content flagged." });
    }

    // This is the line that was crashing:
    const { data, error } = await supabase.storage
      .from('videos')
      .createSignedUrl(video.storagePath, 3600); // URL valid for 1 hour

    if (error) throw error;

    res.status(200).json({ playUrl: data.signedUrl });
  } catch (error) {
    console.error("PLAYBACK ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};