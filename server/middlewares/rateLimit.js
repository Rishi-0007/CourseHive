import rateLimit from "express-rate-limit";

const rateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 3, // Allow 3 requests per window
    message: "Too many password reset attempts. Please try again later.",
});

export { rateLimiter };