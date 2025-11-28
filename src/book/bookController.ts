import type { NextFunction, Request, Response } from "express";
import cloudinary from "../config/cloudinary.js";
import path from "node:path";
import { fileURLToPath } from "url";
import createHttpError from "http-errors";

const createBook = async (req: Request, res: Response, next: NextFunction) => {
    // Fix __dirname in ESM
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    console.log("files:", req.files);

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    // -----------------------------------------------------
    // Validate files
    // -----------------------------------------------------
    if (!files?.coverImage?.[0]) {
        return next(createHttpError(400, "Cover image is required"));
    }
    if (!files?.file?.[0]) {
        return next(createHttpError(400, "Book file (PDF) is required"));
    }

    // -----------------------------------------------------
    // Extract cover image details
    // -----------------------------------------------------
    const coverImage = files.coverImage[0];
    const coverImageName = coverImage.filename;
    const coverImageFormat = coverImage.mimetype.split("/").at(-1) ?? "jpg";

    const coverImagePath = path.resolve(
        __dirname,
        "../../public/data/uploads",
        coverImageName
    );

    // -----------------------------------------------------
    // Extract book file details
    // -----------------------------------------------------
    const bookFile = files.file[0];
    const bookFileName = bookFile.filename;

    const bookFilePath = path.resolve(
        __dirname,
        "../../public/data/uploads",
        bookFileName
    );

    try
    {
        // -----------------------------------------------------
        // Upload cover image to Cloudinary
        // -----------------------------------------------------
        const uploadResult = await cloudinary.uploader.upload(coverImagePath, {
            public_id: coverImageName,
            folder: "book-covers",
            format: coverImageFormat,
        });

        // -----------------------------------------------------
        // Upload PDF (raw file) to Cloudinary
        // -----------------------------------------------------
        const bookFileUploadResult = await cloudinary.uploader.upload(
            bookFilePath,
            {
                resource_type: "raw",
                filename_override: bookFileName,
                folder: "book-pdfs",
                format: "pdf",
            }
        );

        console.log("uploadResult", uploadResult);
        console.log("bookFileUploadResult", bookFileUploadResult);

        // -----------------------------------------------------
        // Final response
        // -----------------------------------------------------
        return res.json({
            message: "Files uploaded successfully",
            coverImage: uploadResult.secure_url,
            bookFile: bookFileUploadResult.secure_url,
        });
    }
    catch
    {
        return next(createHttpError(500, "Error while uploading the files."));
    }
};

export { createBook };
