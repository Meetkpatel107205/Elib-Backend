import type { NextFunction, Request, Response } from "express";
import cloudinary from "../config/cloudinary.js";
import path from "node:path";
import { fileURLToPath } from "url";
import createHttpError from "http-errors";
import bookModel from "./bookModel.js";
import fs from "node:fs";

// -----------------------------
// Types
// -----------------------------
interface UploadFiles {
    coverImage?: Express.Multer.File[];
    file?: Express.Multer.File[];
}

const createBook = async (req: Request, res: Response, next: NextFunction) => {
    // Fix __dirname for ESM modules
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    const { title, genre } = req.body;

    const files = req.files as UploadFiles;

    try
    {
        // -----------------------------
        // Validate Input
        // -----------------------------
        if (!files?.coverImage?.[0])
        {
            throw createHttpError(400, "Cover image is required");
        }

        if (!files?.file?.[0])
        {
            throw createHttpError(400, "Book file (PDF) is required");
        }

        const coverImage = files.coverImage[0];
        const bookFile = files.file[0];

        // -----------------------------
        // Create local file paths
        // -----------------------------
        const coverImagePath = path.resolve(
            __dirname,
            "../../public/data/uploads",
            coverImage.filename
        );

        const bookFilePath = path.resolve(
            __dirname,
            "../../public/data/uploads",
            bookFile.filename
        );

        let uploadedCover;
        let uploadedPDF;

        // -----------------------------
        // Upload cover image
        // -----------------------------
        try
        {
            uploadedCover = await cloudinary.uploader.upload(coverImagePath, {
                public_id: coverImage.filename,
                folder: "book-covers",
                format: coverImage.mimetype.split("/").at(-1) ?? "jpg",
            });
        }
        // catch (err)
        catch
        {
            throw createHttpError(500, "Failed to upload cover image");
        }

        // -----------------------------
        // Upload PDF (raw file)
        // -----------------------------
        try
        {
            uploadedPDF = await cloudinary.uploader.upload(bookFilePath, {
                resource_type: "raw",
                filename_override: bookFile.filename,
                folder: "book-pdfs",
                format: "pdf",
            });
        }
        // catch (err)
        catch
        {
            throw createHttpError(500, "Failed to upload book file");
        }

        // -----------------------------
        // Save book to database
        // -----------------------------
        let newBook;

        try
        {
            newBook = await bookModel.create({
                title,
                genre,
                author: "69297358a71e75921e020980",
                coverImage: uploadedCover.secure_url,
                file: uploadedPDF.secure_url,
            });
        }
        // catch (err)
        catch
        {
            throw createHttpError(500, "Failed to save book to database");
        }

        // -----------------------------
        // Delete temp files
        // -----------------------------
        try
        {
            await fs.promises.unlink(coverImagePath);
            await fs.promises.unlink(bookFilePath);
        }
        catch (err)
        {
            console.warn("Warning: Failed to delete temp files", err);
        }

        // -----------------------------
        // Success response
        // -----------------------------
        return res.status(201).json({ id: newBook._id });
    }
    catch (error)
    {
        return next(error);
    }
};

export { createBook };