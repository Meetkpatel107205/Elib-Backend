import type { NextFunction, Request, Response } from "express";

const createBook = async (req: Request, res: Response, _next: NextFunction) => {

    const {} = req.body;
    
    res.json({});
};

export { createBook };