import type { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import bcrypt from "bcrypt";
import userModel from "./userModel.js";
import jwt from "jsonwebtoken";
import { config } from "../config/config.js";
import type { User } from "./userTypes.js";

const createUser = async (req: Request, res: Response, next: NextFunction) => {

    const { name, email, password } = req.body;

    // 1. Validation :-
    if(!name || !email || !password)
    {
        const error = createHttpError(400, "All fields are required");
        return next(error);
    }

    try
    {
        // Database call
        // const user = await userModel.findOne({ email: email });
        const user = await userModel.findOne({ email });
        
        if(user)
        {
            const error = createHttpError(400, "User already exists with this email.");
            return next(error);
        }
    }
    // catch(err)
    catch
    {
        return next(createHttpError(500, "Error while getting user"));
    }

    // 2. Process :-

    // password -> hash
    // password : secret -> ssssss, secret -> ssssss => salt => secret -> sfdfsfsdf, secret -> fgjasdgjs 
    const hashedPassword = await bcrypt.hash(password, 10);

    let newUser: User;

    try
    {
        newUser = await userModel.create({
            name,
            email,
            password: hashedPassword,
        });
    }
    // catch(err)
    catch
    {
        return next(createHttpError(500, "Error while creating user."));
    }

    try
    {
        // Token Generation - JWT
        const token = jwt.sign(
            { sub: newUser._id },
            config.jwtSecret as string,
            { expiresIn: "7d", algorithm: "HS256"});

        // 3. Response :-
        res.json({ accessToken: token });
    }
    // catch(err)
    catch
    {
        return next(createHttpError(500, "Error while signing the jwt token"));
    }
};

export { createUser };