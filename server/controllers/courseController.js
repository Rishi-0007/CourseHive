import slugify from "slugify";
import { courseModel } from "../models/course.js";
import { z } from "zod";
import asyncHandler from "express-async-handler";
import { userModel } from "../models/user.js";

const courseSchema = z.object({
    title: z.string().min(3).max(50),
    description: z.string().min(10).max(500),
    price: z.number().int(),
    content: z.array(z.object({
        title: z.string().min(3).max(50),
        description: z.string().min(10).max(500),
        url: z.string().url(),
        type: z.enum(["video", "pdf", "quiz"]),
    })),
    difficulty: z.enum(["beginner", "intermediate", "advanced"]),
});

// Create a course
const createCourse = asyncHandler(async (req, res) => {
    const { success, data, error } = courseSchema.safeParse(req.body);

    if (!success) {
        return res.status(400).json({
            success: false,
            errors: error.issues.map(issue => ({
                field: issue.path.join('.'),
                message: issue.message
            }))
        });
    }
    const slug = slugify(data.title, { lower: true, strict: true });
    const existingSlug = await courseModel.findOne({ slug });

    if (existingSlug) {
        return res.status(400).json({
            success: false,
            message: "Course with this title already exists"
        });
    };

    const course = await courseModel.create({
        ...data,
        slug,
        instructor: req.user._id,
    });

    await userModel.findByIdAndUpdate(
        req.user._id,
        { $push: { coursesCreated: course._id } },
        { new: true }
    );

    res.status(201).json({
        success: true,
        data: course,
    });
});

// Get All Courses (with filtering)
const getCourses = asyncHandler(async (req, res) => {
    const { search, difficulty, minPrice, maxPrice, sort } = req.query;

    const query = {};

    if (search) {
        query.$or = [
            { title: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } }
        ];
    }

    if (difficulty) query.difficulty = difficulty;
    if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = Number(minPrice);
        if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const sortOptions = {
        newest: "-createdAt",
        priceAsc: "price",
        priceDesc: "-price"
    };

    const courses = await courseModel.find(query)
        .populate("instructor", "name email")
        .sort(sortOptions[sort] || "-createdAt");

    res.json({
        success: true,
        count: courses.length,
        data: courses
    });
});

// Get a course by slug
const getCourse = asyncHandler(async (req, res) => {
    const course = await courseModel.findOne({ slug: req.params.slug })
        .populate("instructor", "name email bio")

    if (!course) {
        res.status(404).json({ message: "Course not found" });
    }

    res.json({
        success: true,
        data: course
    });
});

// Update course 
const updateCourse = asyncHandler(async (req, res) => {
    const { success, data, error } = courseSchema.safeParse(req.body);

    if (!success) {
        return res.status(400).json({
            success: false,
            errors: error.issues.map(issue => ({
                field: issue.path.join('.'),
                message: issue.message
            }))
        });
    }

    const updates = {
        ...data,
        ...(data.title && { slug: slugify(data.title, { lower: true, strict: true }) })
    };

    const course = await courseModel.findByIdAndUpdate(req.params.id, updates, {
        new: true,
        runValidators: true
    });

    if (!course) {
        return res.status(404).json({ message: "Course not found" });
    }

    res.json({
        success: true,
        data: course
    });
});

// Delete course
const deleteCourse = asyncHandler(async (req, res) => {
    const course = await courseModel.findByIdAndDelete(req.params.id);

    if (!course) {
        return res.status(404).json({ message: "Course not found" });
    }

    res.json({
        success: true,
        data: {}
    });
});

export { createCourse, getCourses, getCourse, updateCourse, deleteCourse };