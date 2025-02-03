import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import asyncHandler from "express-async-handler";
import { userModel } from "../models/user.js";
import { sendEmail } from "../utils/sendEmail.js";
import { z } from "zod";

const userSchema = z.object({
    name: z.string().min(3).max(50),
    email: z.string().email(),
    password: z.string().min(8).max(50),
    role: z.string().optional(),
})

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: "30d",
    });
};

// Register User
const registerUser = asyncHandler(async (req, res) => {
    try {
        const validateData = userSchema.safeParse(req.body);

        if (!validateData.success) {
            return res.status(400).json({
                success: false,
                errors: validateData.error.issues.map(issue => ({
                    field: issue.path.join('.'),
                    message: issue.message
                }))
            });
        }

        const { name, email, password, role } = validateData.data;

        // Check if user exists
        const userExists = await userModel.findOne({ email });
        if (userExists) {
            res.status(400).json({ message: "User already exists" });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const user = await userModel.create({
            name,
            email,
            password: hashedPassword,
            role: role || "student",
        });

        if (user) {
            // Set JWT as HTTP-only cookie
            res.cookie("token", generateToken(user._id), {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
            });

            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            });
        } else {
            res.status(400).json({ message: "Invalid user data" });
        }
    }
    catch (err) {
        res.status(400);
        throw new Error(err.message);
    }
});

// Login User
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Check for user
    const user = await userModel.findOne({ email });
    if (!user) {
        res.status(401).json({ message: "Invalid email or password" });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        res.status(401).json({ message: "Invalid email or password" });
    }

    // Set JWT cookie
    res.cookie("token", generateToken(user._id), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
    });
});

// Logout User
const logoutUser = asyncHandler(async (req, res) => {
    res.cookie("token", "", {
        httpOnly: true,
        expires: new Date(0), // Immediately expire
    });
    res.status(200).json({ message: "Logged out successfully" });
});

// Get User Profile (Protected Route Example)
const getUserProfile = asyncHandler(async (req, res) => {
    const user = await userModel.findById(req.user.id)
        .populate({
            path: 'coursesEnrolled',
            select: 'title description slug price'
        })
        .populate({
            path: 'coursesCreated',
            select: 'title slug studentsEnrolled createdAt'
        })
        .select('-password');

    res.json({
        success: true,
        data: user
    });
});

// Forgot Password (Send Reset Email)
const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const user = await userModel.findOne({ email });

    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }

    // Generate JWT Reset Token (expires in 10 minutes)
    const resetToken = sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "10m" });

    // Send reset email
    const resetUrl = `${req.protocol}://${req.get("host")}/api/auth/reset-password/${resetToken}`;
    await sendEmail({
        to: user.email,
        subject: "Password Reset Request",
        text: `You requested a password reset. Click here: ${resetUrl}`,
    });

    res.json({ message: "Password reset email sent" });
});

// Reset Password
const resetPassword = asyncHandler(async (req, res) => {
    const { password } = req.body;
    const resetToken = req.params.token;

    try {
        // Verify JWT token
        const decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
        const user = await userModel.findById(decoded.id);

        if (!user) {
            res.status(400);
            throw new Error("Invalid token or user does not exist");
        }

        // Update password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();

        res.json({ message: "Password updated successfully" });
    } catch (error) {
        res.status(400);
        throw new Error("Invalid or expired token");
    }
});


export { registerUser, loginUser, logoutUser, getUserProfile, forgotPassword, resetPassword };
