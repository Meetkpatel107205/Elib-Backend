import express from 'express'

const app = express();

// Routes :-

// Http Methods :- GET, POST, PUT, PATCH, DELETE

app.get('/', (req, res, _next) => {
    res.json({message: "Welcome to elib apis"});
});

export default app;