import mongoose from "mongoose";
import { Schema } from "mongoose";

const userSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
        type: String,
        enum: ["student", "instructor", "admin"],
        default: "student"
    },
    avatar: { type: String, default: "" },
    coursesEnrolled: [{ type: Schema.ObjectId, ref: "Course" }],    // for student
    coursesCreated: [{ type: Schema.ObjectId, ref: "Course" }]      // for instructor
})

export const userModel = mongoose.model("User", userSchema);