import mongoose from "mongoose";

const predictionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    mediaType: {
      type: String,
      enum: ["image", "video", "text"],
      required: true
    },

    mediaMeta: {
      resolution: String,          // e.g. 1080p
      orientation: String,         // Portrait / Landscape
      aspectRatio: String          // 9:16, 16:9
    },

    captionLength: Number,
    hashtagCount: Number,
    postTime: String,
    dayOfWeek: String,
    location: String,
    targetAudience: String,

    engagementClass: {
      type: String,
      enum: ["Low", "Medium", "High"]
    },

    viralityScore: Number,         // 0–100

    suggestions: [String]          // Actionable feedback
  },
  { timestamps: true }
);

export default mongoose.model("Prediction", predictionSchema);