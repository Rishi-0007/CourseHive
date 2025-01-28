import mongoose from "mongoose";
import { Schema } from "mongoose";

const Course = new Schema({
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true }, // SEO-friendly URL
    description: { type: String, required: true },
    price: { type: Number, required: true },
    instructor: {
        type: Schema.ObjectId,
        required: true,
        ref: "User"
    },
    category: { type: Schema.ObjectId, ref: "Category" },
    content: [{
        title: String,
        description: String,
        url: String,    // Video URL
        type: {
            type: String,
            enum: ["video", "pdf", "quiz"],
        }
    }],
    difficulty: {
        type: String,
        enum: ["beginner", "intermediate", "advanced"],
        default: "beginner",
    }
})

export const courseModel = mongoose.model("Course", Course)