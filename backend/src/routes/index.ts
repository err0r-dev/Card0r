import express from 'express';
import validationRouter from './validation.js';
import uploadRouter from './upload.js';
import messagesRouter from './messages.js';
import musicRouter from './music.js';
import videosRouter from './videos.js';

const router = express.Router();

router.use('/validate-keys', validationRouter);
router.use('/upload-csv', uploadRouter);
router.use('/generate-messages', messagesRouter);
router.use('/music', musicRouter);
router.use('/videos', videosRouter);

export default router;
