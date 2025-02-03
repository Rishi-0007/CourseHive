import asyncHandler from 'express-async-handler';
import { courseModel } from '../models/course';
import { userModel } from '../models/user';

const enrollCourse = asyncHandler(async (req, res) => {
    const course = await courseModel.findById(req.params.courseId);
    const user = await userModel.findById(req.user.id);

    if (!course) {
        res.status(404).json({ message: 'Course not found' });
    }

    // Check if already enrolled
    if (user.coursesEnrolled.includes(course._id)) {
        res.status(400).json({ message: 'Already enrolled in this course' });
    }

    // Update both user and course
    await Promise.all([
        userModel.findByIdAndUpdate(
            user._id,
            { $push: { coursesEnrolled: course._id } },
            { new: true }
        ),
        courseModel.findByIdAndUpdate(
            course._id,
            { $push: { studentsEnrolled: user._id } },
            { new: true }
        )
    ]);

    res.json({
        success: true,
        message: 'Successfully enrolled in course'
    });
});

// unenroll course
const unenrollCourse = asyncHandler(async (req, res) => {
    const course = await courseModel.findById(req.params.courseId);
    const user = await userModel.findById(req.user.id);

    if (!course) {
        res.status(404).json({ message: 'Course not found' });
    }

    // Check if already enrolled
    if (!user.coursesEnrolled.includes(course._id)) {
        res.status(400).json({ message: 'Not enrolled in this course' });
    }

    // Update both user and course
    await Promise.all([
        userModel.findByIdAndUpdate(
            user._id,
            { $pull: { coursesEnrolled: course._id } },
            { new: true }
        ),
        courseModel.findByIdAndUpdate(
            course._id,
            { $pull: { studentsEnrolled: user._id } },
            { new: true }
        )
    ]);

    res.json({
        success: true,
        message: 'Successfully unenrolled from course'
    });
});

export { enrollCourse, unenrollCourse };