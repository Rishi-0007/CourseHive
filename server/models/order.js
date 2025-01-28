import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
            required: true,
        },
        paymentStatus: {
            type: String,
            enum: ["pending", "completed", "failed"],
            default: "pending",
        },
        amountPaid: { type: Number, required: true },
        paymentId: { type: String }, // Stripe/Razorpay transaction ID
    },
    { timestamps: true }
);

export const orderModel = mongoose.model("Order", orderSchema);