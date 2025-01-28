import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
    {
        name: { type: String, required: true, unique: true },
        slug: { type: String, required: true, unique: true }, // For URLs
    }
);

export const categoryModel = mongoose.model("Category", categorySchema);