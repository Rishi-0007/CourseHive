import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { authRouter } from "./routes/auth.js";
import cookieParser from "cookie-parser";
import { courseRouter } from "./routes/course.js";
import { enrollmentRouter } from "./routes/enrollment.js";

dotenv.config();
const app = express();

app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/auth", authRouter);
app.use("/api/courses", courseRouter);
app.use("/api/enrollments", enrollmentRouter);

mongoose.connect(process.env.MONGO_DB_URI).then(() => {
    app.listen(3000, () => {
        console.log("Server is running on port 3000");
    })
}).catch(err => {
    console.error(err);
})  