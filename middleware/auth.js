const jwt = require("jsonwebtoken");
require("dotenv").config();
const JWT_SECRET = process.env.JWT_SECRET;

const auth = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: "Token is required" });
        }
        jwt.verify(token, JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(401).json({ message: "You are not authorized to access this page" });
            }
            req.userId = decoded.userId; // Extract just the userId from the decoded token
            next();
        });
    } catch (error) {
        return res.status(401).json({ message: "Invalid token format" });
    }
};

module.exports = auth;
