import express from 'express';
import { createBook, updateBook } from './bookController.js';
import path from 'node:path';
import multer from 'multer';
import { fileURLToPath } from "url";
import authenticate from '../middlewares/authenticate.js';

// Fix __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const bookRouter = express.Router();

// file store local -> 
const upload = multer({
    dest: path.resolve(__dirname, '../../public/data/uploads'),
    // limits: { fileSize: 3e7 } 30mb = 30 (mb) * 1024 (kb) * 1024 bytes
    limits: { fileSize: 1e7 } // 10mb = 10 (mb) * 1024 (kb) * 1024 bytes
});

// Routes :-

// api/books
bookRouter.post('/', authenticate, upload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'file', maxCount: 1 },
]), createBook);

bookRouter.patch('/:bookId', authenticate, upload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'file', maxCount: 1 },
]), updateBook);

export default bookRouter;