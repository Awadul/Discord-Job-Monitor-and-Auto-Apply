import express from "express";
import { exec } from "child_process";
import { errorhandler } from "./utils/errorhandler.util.js";
import { authMiddleware, loginAuth } from "./middlewares/auth.middleware.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

let state = "stopped";
const app = express();

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

app.use(cookieParser());
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

app.get("/", (req, res) => {
    res.json({
        message: "Welcome to the Job Search Bot API",
    })
});

app.post("/login", loginAuth, (req, res) => {
    res.json({
        message: "login successfully",
        state: state
    })
})

app.use(authMiddleware);
app.get("/state-check", (req, res) => {
    res.json({
        message: "state checked successfully",
        state: state
    })
});

app.get("/run-script", (req, res) => {
    // exec("pm2 start bot.js --name \"job-search-bot\"", (error, stdout, stderr) => {
    exec("node bot.js", (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
    })
    state = "running";
    res.json({
        message: "Bot started",
        state: state
    })
});

app.post("/pause-bot", (req, res) => {
    exec("pm2 stop job-search-bot", (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
    });
    state = "paused";
    res.json({
        message: "Bot paused",
        state: state
    })
})

app.post("/resume-bot", (req, res) => {
    exec("pm2 restart job-search-bot", (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            return;
        }
        state = "running";
        console.log(`stdout: ${stdout}`);
    })
    res.json({
        message: "Bot resumed",
        state: state
    })
})

app.use(errorhandler);

app.listen(5000, () => {
    console.log("Server is running on port 5000");
});