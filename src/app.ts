import express from 'express';
import globalErrorHandler from './middlewares/globalErrorHandler.js';
import userRouter from './user/userRouter.js';

const app = express();

app.use(express.json());

// Routes :-

// Http Methods :- GET, POST, PUT, PATCH, DELETE

app.get('/', (req, res, _next) => {
    res.json({message: "Welcome to elib apis"});
});

app.use('/api/users', userRouter);

// Global error handler
app.use(globalErrorHandler);

export default app;