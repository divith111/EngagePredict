import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import predictionRoutes from "./routes/predictionRoutes.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/predict", predictionRoutes);

mongoose.connect(process.env.MONGO_URI);

app.listen(5000, () => {
  console.log("Backend running on port 5000");
});
