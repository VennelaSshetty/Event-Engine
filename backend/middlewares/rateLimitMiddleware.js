import rateLimit, { ipKeyGenerator } from "express-rate-limit";

const rateLimitMiddleware = rateLimit({
  windowMs: 15 * 60 * 1000,

  max: 100,

  message: {
    error: "Too many requests",
    message: "Please try again later"
  },

  standardHeaders: true,

  legacyHeaders: false,

  keyGenerator: (req) => {
    return req.client?.apiKey || ipKeyGenerator(req);
  }
});

export default rateLimitMiddleware;