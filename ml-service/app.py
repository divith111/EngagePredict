from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import uvicorn

from inference import EngagementPredictor
from media_analyzer import MediaAnalyzer
from recommendation_engine import RecommendationEngine

app = FastAPI(
    title="EngagePredict ML Service",
    description="ML-powered social media engagement prediction API",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize components
predictor = EngagementPredictor()
media_analyzer = MediaAnalyzer()
recommendation_engine = RecommendationEngine()


class MediaInfo(BaseModel):
    type: Optional[str] = None
    width: Optional[int] = None
    height: Optional[int] = None
    orientation: Optional[str] = None
    aspectRatio: Optional[str] = None
    resolution: Optional[str] = None
    qualityScore: Optional[str] = None
    duration: Optional[int] = None


class PredictionRequest(BaseModel):
    caption: str = ""
    hashtags: str = ""
    platform: str = "instagram"
    postingTime: str = "12:00"
    dayOfWeek: str = "Wednesday"
    location: str = ""
    targetAudience: str = "General"
    mediaInfo: Optional[MediaInfo] = None
    userId: Optional[str] = None


class FeedbackItem(BaseModel):
    type: str
    text: str
    impact: str


class PredictionResponse(BaseModel):
    score: int
    engagementLevel: str
    feedback: List[FeedbackItem]
    tips: List[str]
    predictedReach: int
    predictedLikes: int
    predictedComments: int


@app.get("/")
async def root():
    return {
        "service": "EngagePredict ML Service",
        "version": "1.0.0",
        "status": "running"
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy", "model_loaded": predictor.is_ready()}


@app.post("/predict", response_model=PredictionResponse)
async def predict_engagement(request: PredictionRequest):
    """
    Predict engagement score for social media content
    """
    try:
        # Get ML prediction
        prediction = predictor.predict(
            caption=request.caption,
            hashtags=request.hashtags,
            platform=request.platform,
            posting_time=request.postingTime,
            day_of_week=request.dayOfWeek,
            media_info=request.mediaInfo.dict() if request.mediaInfo else None
        )
        
        # Generate recommendations
        recommendations = recommendation_engine.generate(
            score=prediction["score"],
            platform=request.platform,
            media_info=request.mediaInfo.dict() if request.mediaInfo else None,
            caption_length=len(request.caption),
            hashtag_count=len(request.hashtags.split()) if request.hashtags else 0
        )
        
        return PredictionResponse(
            score=prediction["score"],
            engagementLevel=prediction["engagement_level"],
            feedback=prediction["feedback"],
            tips=recommendations["tips"],
            predictedReach=prediction["predicted_reach"],
            predictedLikes=prediction["predicted_likes"],
            predictedComments=prediction["predicted_comments"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/analyze-media")
async def analyze_media(file: UploadFile = File(...)):
    """
    Analyze uploaded media file for quality metrics
    """
    try:
        contents = await file.read()
        analysis = media_analyzer.analyze(contents, file.content_type)
        return analysis
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
