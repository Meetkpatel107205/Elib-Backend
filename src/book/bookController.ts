import type { NextFunction, Request, Response } from "express";
import cloudinary from "../config/cloudinary.js";
import path from "node:path";
import { fileURLToPath } from "url";
import createHttpError from "http-errors";
import bookModel from "./bookModel.js";
import fs from "node:fs";
import type { AuthRequest } from "../middlewares/authenticate.js";

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
            const _req = req as AuthRequest;

            newBook = await bookModel.create({
                title,
                genre,
                author: _req.userId as any,
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

const updateBook = async (req: Request, res: Response, next: NextFunction) => {

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    const { title, genre } = req.body;
    const bookId = req.params.bookId;

    // if (!bookId)
    // {
    //     return next(createHttpError(400, "Book ID is required"));
    // }

    // const book = await bookModel.findOne({ _id: bookId });
    const book = await bookModel.findById({ _id: bookId });

    if(!book)
    {
        return next(createHttpError(404, "Book not found"));
    }

    // Check access
    const _req = req as AuthRequest;
    if(book.author.toString() !== _req.userId)
    {
        return next(createHttpError(403, "You cannot update others book."));
    }

   // --------------------------------------------------------------------
    // FIX TS ERROR: req.files type must match your UploadFiles interface
    // --------------------------------------------------------------------
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    let completeCoverImage = "";

    // --------------------------------------------------------------------
    // UPDATE COVER IMAGE
    // --------------------------------------------------------------------
    if (files?.coverImage?.[0]) {

        const uploadedFile = files.coverImage[0];
        const filename = uploadedFile.filename;
        const coverMimeType = uploadedFile.mimetype.split("/").at(-1) ?? "jpg";

        const filePath = path.resolve(
            __dirname,
            "../../public/data/uploads",
            filename
        );

        completeCoverImage = filename;

        const uploadResult = await cloudinary.uploader.upload(filePath, {
            filename_override: completeCoverImage,
            folder: "book-covers",
            format: coverMimeType
        });

        completeCoverImage = uploadResult.secure_url;
        await fs.promises.unlink(filePath);
    }

    // --------------------------------------------------------------------
    // UPDATE BOOK PDF
    // --------------------------------------------------------------------
    let completeFileName = "";

    if (files?.file?.[0])
    {

        const uploadedPDF = files.file[0];
        const pdfFilename = uploadedPDF.filename;
        const pdfMimeType = uploadedPDF.mimetype.split("/").at(-1);

        const bookFilePath = path.resolve(
            __dirname,
            "../../public/data/uploads",
            pdfFilename
        );

        const finalName = `${pdfFilename}.${pdfMimeType}`;

        const uploadResultPdf = await cloudinary.uploader.upload(bookFilePath, {
            resource_type: "raw",
            filename_override: finalName,
            folder: "book-pdfs",
            format: "pdf"
        });

        completeFileName = uploadResultPdf.secure_url;
        await fs.promises.unlink(bookFilePath);
    }

    const updateBook = await bookModel.findByIdAndUpdate(
        {
            _id: bookId,
        },
        {
            title: title,
            genre: genre,
            coverImage: completeCoverImage ? completeCoverImage : book.coverImage,
            file: completeFileName ? completeFileName : book.file,
        },
        { new: true }
    );

    res.json(updateBook);
};

export { createBook, updateBook };