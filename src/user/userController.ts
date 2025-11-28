import type { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";

const createUser = async (req: Request, res: Response, next: NextFunction) => {

    const { name, email, password } = req.body;

    // 1. Validation :-
    if(!name || !email || !password)
    {
        const error = createHttpError(400, "All fields are required");
        return next(error);
    }

    // 2. Process :-

    // 3. Response :-
    
    res.json({ message: "User created"} );
};

export { createUser };