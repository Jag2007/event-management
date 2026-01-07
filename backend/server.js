import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/database.js";
import userRoutes from "./routes/userRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import errorHandler from "./middleware/errorHandler.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://event-management-ten-nu.vercel.app",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/users", userRoutes);
app.use("/api/events", eventRoutes);

// Health check route
app.get("/", (req, res) => {
  res.json({ message: "Event Management API is running" });
});

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
