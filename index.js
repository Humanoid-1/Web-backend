import express from "express";
import cors from "cors";
import routes from "./routes.js";
import errorHandler from "./middleware/errorMiddleware.js";
import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import paymentRoutes from "./routes/paymentRoutes.js";

dotenv.config();

const app = express();

// __dirname fix for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ------------------- CORS Setup -------------------
// Only allow production frontend
const allowedOrigins = [
  "https://web-frontend-pi-sable.vercel.app"
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        return callback(new Error(`CORS policy: This origin (${origin}) is not allowed`), false);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

app.use(express.json());

// Serve uploads
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// API routes (includes laptops, accessories, parts, orders, etc.)
app.use("/api", routes);

// Payment Routes
app.use("/api/payment", paymentRoutes);

// Error handler (after routes)
app.use(errorHandler);

// ------------------- MongoDB connection -------------------
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log(
      `✅ MongoDB Connected: ${mongoose.connection.host}/${mongoose.connection.name}`
    );
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Web server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
  });

// Graceful shutdown
process.on("SIGINT", async () => {
  await mongoose.connection.close();
  console.log("MongoDB connection closed");
  process.exit(0);
});
