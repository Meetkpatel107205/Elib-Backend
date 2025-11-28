import express from 'express';
import globalErrorHandler from './middlewares/globalErrorHandler.js';

const app = express();

// Routes :-

// Http Methods :- GET, POST, PUT, PATCH, DELETE

app.get('/', (req, res, _next) => {
    res.json({message: "Welcome to elib apis"});
});

// Global error handler
app.use(globalErrorHandler);

export default app;