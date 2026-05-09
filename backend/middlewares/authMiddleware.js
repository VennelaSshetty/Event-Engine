import ApiKey from "../models/ApiKey.js";

const authMiddleware = async (req, res, next) => {
  try {
    const apiKey = req.headers["x-api-key"];

    if (!apiKey) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "API key required"
      });
    }

    const keyRecord = await ApiKey.findOne({ key: apiKey });

    if (!keyRecord || !keyRecord.isActive) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Invalid or inactive API key"
      });
    }

 req.client = {
  appName: keyRecord.appName,
  apiKey: keyRecord.key,
};

    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export default authMiddleware;