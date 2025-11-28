import express from 'express';
import { createBook } from './bookController.js';

const bookRouter = express.Router();

// Routes :-

// api/books
bookRouter.post('/', createBook);

export default bookRouter;