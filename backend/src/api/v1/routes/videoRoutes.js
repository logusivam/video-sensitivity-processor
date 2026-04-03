import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { requireAuth } from '../middlewares/requireAuth.js';
import { uploadVideo, getMyVideos, getOrgVideos, getPlayUrl, deleteVideo } from '../controllers/videoController.js';

const router = express.Router();

// 📌 USE ABSOLUTE PATH FOR WINDOWS
const tempDir = path.resolve('uploads/temp');

if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
}

const upload = multer({ 
    dest: tempDir,
    limits: { fileSize: 2 * 1024 * 1024 * 1024 } // 2GB
});

router.use(requireAuth);

router.post('/upload', upload.single('video'), uploadVideo);
router.get('/my-uploads', getMyVideos);
router.get('/organization', getOrgVideos);
router.get('/play/:id', requireAuth, getPlayUrl);
router.delete('/:id', requireAuth, deleteVideo);

export default router;