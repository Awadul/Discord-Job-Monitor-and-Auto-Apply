import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asynchandler.util.js";

const loginAuth = async (req, res, next) => {
    const { username, password } = req.body;
    if (!username || !password) {
        throw new Error("All fields are required");
    }
    if (username !== process.env.EMAIL || password !== process.env.PASSWORD) {
        console.log("[Username env]: ", process.env.EMAIL);
        console.log("[Password env]: ", process.env.PASSWORD);

        console.log("[Username]: ", username);
        console.log("[Password]: ", password);
        // set cookie to empty
        // res.cookie("token", "", {
        //     httpOnly: true,
        //     secure: true,
        //     sameSite: "strict",
        //     maxAge: 0
        // });
        // throw error
        throw new Error("Invalid credentials");
    }
    const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
    const expiresHours = parseInt(process.env.JWT_EXPIRES_IN) || 2;
    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: expiresHours * 60 * 60 * 1000
    });
    res.json({

        message: "Login successful"
    });
}

const authMiddleware = asyncHandler(async (req, res, next) => {
    const token = req.cookies?.token;
    if (!token) {
        throw new Error("Unauthorized");
    }
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decodedToken;
    next();
})

export { authMiddleware, loginAuth };