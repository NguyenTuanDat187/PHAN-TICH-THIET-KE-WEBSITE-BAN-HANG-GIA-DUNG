import cors from "cors";
import express from "express";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
    res.json({
        message: "API E-Commerce Backend is running",
        timestamp: new Date().toISOString()
    });
});

export default app;