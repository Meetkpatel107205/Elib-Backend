import type { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import bcrypt from "bcrypt";
import userModel from "./userModel.js";
import jwt from "jsonwebtoken";
import { config } from "../config/config.js";

const createUser = async (req: Request, res: Response, next: NextFunction) => {

    const { name, email, password } = req.body;

    // 1. Validation :-
    if(!name || !email || !password)
    {
        const error = createHttpError(400, "All fields are required");
        return next(error);
    }

    // Database call
    // const user = await userModel.findOne({ email: email });
    const user = await userModel.findOne({ email });

    if(user)
    {
        const error = createHttpError(400, "User already exists with this email.");
        return next(error);
    }

    // 2. Process :-

    // password -> hash
    // password : secret -> ssssss, secret -> ssssss => salt => secret -> sfdfsfsdf, secret -> fgjasdgjs 
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await userModel.create({
        name,
        email,
        password: hashedPassword,
    });

    // Token Generation - JWT
    const token = jwt.sign(
        { sub: newUser._id },
        config.jwtSecret as string,
        { expiresIn: "7d", algorithm: "HS256"});

    // 3. Response :-
    res.json({ accessToken: token });
};

export { createUser };