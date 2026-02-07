export const predictEngagement = async (req, res) => {
  const data = req.body;

  let score = 70; // temporary
  let suggestions = [];

  if (data.mediaMetadata.orientation === "landscape") {
    suggestions.push("Use portrait orientation for Reels/TikTok");
    score -= 10;
  }

  if (data.captionLength < 50) {
    suggestions.push("Increase caption length for better engagement");
  }

  res.json({
    viralityScore: score,
    engagementClass: score > 80 ? "High" : score > 50 ? "Medium" : "Low",
    suggestions
  });
};
