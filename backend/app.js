import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import "colors";
import cookieParser from "cookie-parser";
import connectDB from "./database/connectDB.js";
import productRoutes from "./routes/ProductRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import errorMiddleware from "./middlewares/errors.js";
import orderRoutes from "./routes/orderRoutes.js";
import paymentRoutes from "./routes/payment.js";
import cron from "node-cron";
import axios from "axios";

import path from "path";
const __filename = dotenv.config({ path: "backend/config/config.env" });

const app = express();

// Use CORS middleware
app.use(cors());

// Connect to MongoDB
connectDB();

app.use(
  express.json({
    limit: "10mb",
    verify: (req, res, buf) => {
      req.rawBody = buf.toString();
    },
  })
);
app.use(cookieParser());

// Import all routes
app.use("/api/v1", productRoutes);
app.use("/api/v1", authRoutes);
app.use("/api/v1", orderRoutes);
app.use("/api/v1", paymentRoutes);

app.use(errorMiddleware);

// Deployment
const __dirname1 = path.resolve();
if (process.env.NODE_ENV === "PRODUCTION") {
  app.use(express.static(path.join(__dirname1, "/frontend/build")));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname1, "frontend", "build", "index.html"));
  });
} else {
  app.get("/", (req, res) => {
    res.send("API is Running Successfully");
  });
}

// Ping route to keep the server alive
app.get("/ping", (req, res) => {
  res.send("Server is alive");
});

// Schedule a cron job to run every 10 minutes
cron.schedule("*/10 * * * *", async () => {
  try {
    const response = await axios.get("https://v9replica.onrender.com/ping");
    console.log("Ping response:", response.data);
  } catch (error) {
    console.error("Error pinging server:", error.message);
  }
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(
    `Server is running on PORT: ${PORT} in ${process.env.NODE_ENV} mode`.yellow
      .bold
  );
});
