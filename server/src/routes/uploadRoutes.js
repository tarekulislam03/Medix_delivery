import express from 'express';
import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { optionalAuth } from '../middleware/auth.js';
import { sendSuccess, sendError } from '../utils/response.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '../../uploads');

// Ensure upload directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer memory storage to allow Sharp image processing or audio saving before writing to disk
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB
  },
  fileFilter: (req, file, cb) => {
    const allowedImageMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    const allowedAudioMimes = [
      'audio/webm',
      'audio/mp4',
      'audio/ogg',
      'audio/wav',
      'audio/mpeg',
      'audio/aac',
      'audio/m4a',
      'audio/x-m4a',
    ];

    if (allowedImageMimes.includes(file.mimetype) || allowedAudioMimes.includes(file.mimetype) || file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only standard image and audio files are allowed'));
    }
  },
});

const router = express.Router();

/**
 * POST /api/uploads and POST /uploads
 * Process, optimize, compress to webp for images, or save audio notes securely
 */
router.post('/', optionalAuth, (req, res) => {
  upload.single('file')(req, res, async (err) => {
    if (err) {
      return sendError(res, 'UPLOAD_ERROR', err.message, 400);
    }

    if (!req.file) {
      return sendError(res, 'NO_FILE', 'Please select a file to upload', 400);
    }

    try {
      const isAudio = req.file.mimetype.startsWith('audio/');

      if (isAudio) {
        let ext = '.webm';
        if (req.file.mimetype.includes('mp4') || req.file.mimetype.includes('m4a')) ext = '.m4a';
        else if (req.file.mimetype.includes('ogg')) ext = '.ogg';
        else if (req.file.mimetype.includes('wav')) ext = '.wav';
        else if (req.file.mimetype.includes('mpeg')) ext = '.mp3';

        const filename = `voice_${Date.now()}_${Math.random().toString(36).slice(2, 9)}${ext}`;
        const outputPath = path.join(uploadsDir, filename);

        await fs.promises.writeFile(outputPath, req.file.buffer);
        const publicUrl = `/uploads/${filename}`;

        return sendSuccess(
          res,
          {
            url: publicUrl,
            filename,
            format: 'audio',
            mimetype: req.file.mimetype,
            size: req.file.size,
          },
          'Audio recorded and stored successfully',
          201
        );
      }

      // Process image with Sharp
      const filename = `rx_${Date.now()}_${Math.random().toString(36).slice(2, 9)}.webp`;
      const outputPath = path.join(uploadsDir, filename);

      const metadata = await sharp(req.file.buffer).metadata();

      if (!['jpeg', 'png', 'webp'].includes(metadata.format)) {
        return sendError(res, 'INVALID_IMAGE_FORMAT', 'Unrecognized or corrupted image format', 400);
      }

      await sharp(req.file.buffer)
        .rotate() // auto-orient based on EXIF
        .resize(1920, 1920, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 82 })
        .toFile(outputPath);

      const publicUrl = `/uploads/${filename}`;

      return sendSuccess(
        res,
        {
          url: publicUrl,
          filename,
          format: 'webp',
          width: metadata.width,
          height: metadata.height,
        },
        'Image uploaded and processed successfully',
        201
      );
    } catch (processErr) {
      console.error('[Upload Error]', processErr);
      return sendError(res, 'PROCESSING_ERROR', 'Failed to save media: ' + processErr.message, 500);
    }
  });
});

export default router;
