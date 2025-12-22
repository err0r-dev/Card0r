import express from 'express';
import multer from 'multer';
import { parseCSV, parseExcel } from '../services/csv-parser.js';
import type { CsvUploadResponse } from '@card0r/shared';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  dest: 'temp/',
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760') // 10MB default
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only CSV and Excel files are allowed.'));
    }
  }
});

router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        recipients: [],
        errors: ['No file uploaded']
      } as CsvUploadResponse);
    }

    const filePath = req.file.path;
    const mimeType = req.file.mimetype;

    let result: CsvUploadResponse;

    if (mimeType === 'text/csv') {
      result = await parseCSV(filePath);
    } else {
      result = await parseExcel(filePath);
    }

    // Clean up uploaded file
    await import('fs/promises').then(fs => fs.unlink(filePath));

    res.json(result);
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      recipients: [],
      errors: [error instanceof Error ? error.message : 'Upload failed']
    } as CsvUploadResponse);
  }
});

export default router;
