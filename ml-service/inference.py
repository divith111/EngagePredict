import numpy as np
import random
from typing import Dict, List, Optional
import re


class EngagementPredictor:
    """
    ML-based engagement prediction using rule-based scoring and Random Forest concepts.
    In production, this would load a trained sklearn model.
    """
    
    def __init__(self):
        self.model_loaded = True
        
        # Platform-specific optimal settings
        self.platform_config = {
            "instagram": {
                "preferred_orientation": "Portrait",
                "optimal_caption_length": (100, 2200),
                "optimal_hashtag_count": (3, 30),
                "peak_hours": [(9, 11), (12, 14), (19, 21)],
                "best_days": ["Tuesday", "Wednesday", "Thursday"]
            },
            "tiktok": {
                "preferred_orientation": "Portrait",
                "optimal_caption_length": (50, 300),
                "optimal_hashtag_count": (3, 8),
                "peak_hours": [(19, 23), (12, 15)],
                "best_days": ["Tuesday", "Thursday", "Friday"]
            },
            "youtube": {
                "preferred_orientation": "Landscape",
                "optimal_caption_length": (200, 5000),
                "optimal_hashtag_count": (3, 15),
                "peak_hours": [(14, 16), (19, 21)],
                "best_days": ["Friday", "Saturday", "Sunday"]
            },
            "twitter": {
                "preferred_orientation": "Any",
                "optimal_caption_length": (50, 280),
                "optimal_hashtag_count": (1, 3),
                "peak_hours": [(8, 10), (12, 13), (17, 18)],
                "best_days": ["Monday", "Tuesday", "Wednesday"]
            },
            "facebook": {
                "preferred_orientation": "Any",
                "optimal_caption_length": (40, 500),
                "optimal_hashtag_count": (1, 5),
                "peak_hours": [(13, 16), (19, 21)],
                "best_days": ["Wednesday", "Thursday", "Friday"]
            }
        }
    
    def is_ready(self) -> bool:
        return self.model_loaded
    
    def predict(
        self,
        caption: str,
        hashtags: str,
        platform: str,
        posting_time: str,
        day_of_week: str,
        media_info: Optional[Dict] = None
    ) -> Dict:
        """
        Predict engagement score based on content features
        """
        score = 50  # Base score
        feedback = []
        
        config = self.platform_config.get(platform, self.platform_config["instagram"])
        
        # --- Feature Extraction ---
        caption_length = len(caption)
        hashtag_matches = re.findall(r'#\w+', hashtags)
        hashtag_count = len(hashtag_matches)
        
        try:
            hour = int(posting_time.split(':')[0])
        except:
            hour = 12
        
        # --- Scoring Logic ---
        
        # 1. Media Quality Analysis
        if media_info:
            orientation = media_info.get("orientation", "")
            resolution = media_info.get("resolution", "")
            quality_score = media_info.get("qualityScore", "")
            
            # Resolution scoring
            if resolution in ["4K", "1080p"]:
                score += 15
                feedback.append({
                    "type": "success",
                    "text": f"Excellent {resolution} resolution for maximum clarity",
                    "impact": "+15%"
                })
            elif resolution == "720p":
                score += 5
                feedback.append({
                    "type": "warning",
                    "text": "Consider 1080p for professional quality",
                    "impact": "+5%"
                })
            elif resolution in ["SD", "480p"]:
                score -= 10
                feedback.append({
                    "type": "error",
                    "text": "Low resolution will hurt engagement significantly",
                    "impact": "-10%"
                })
            
            # Orientation scoring (platform-specific)
            preferred = config["preferred_orientation"]
            if preferred != "Any":
                if orientation == preferred:
                    score += 20
                    feedback.append({
                        "type": "success",
                        "text": f"{orientation} orientation is perfect for {platform}",
                        "impact": "+20%"
                    })
                else:
                    score -= 15
                    feedback.append({
                        "type": "error",
                        "text": f"Switch to {preferred} for 40% higher reach on {platform}",
                        "impact": "-15%"
                    })
        
        # 2. Caption Analysis
        min_len, max_len = config["optimal_caption_length"]
        if min_len <= caption_length <= max_len:
            score += 10
            feedback.append({
                "type": "success",
                "text": "Caption length is optimized for engagement",
                "impact": "+10%"
            })
        elif caption_length < min_len:
            score -= 5
            feedback.append({
                "type": "warning",
                "text": f"Add more context to your caption (aim for {min_len}+ characters)",
                "impact": "-5%"
            })
        elif caption_length > max_len:
            score -= 5
            feedback.append({
                "type": "warning",
                "text": f"Consider shortening your caption for better readability",
                "impact": "-5%"
            })
        
        # 3. Hashtag Analysis
        min_hash, max_hash = config["optimal_hashtag_count"]
        if min_hash <= hashtag_count <= max_hash:
            score += 10
            feedback.append({
                "type": "success",
                "text": f"{hashtag_count} hashtags is within the optimal range",
                "impact": "+10%"
            })
        elif hashtag_count < min_hash:
            score -= 5
            needed = min_hash - hashtag_count
            feedback.append({
                "type": "warning",
                "text": f"Add {needed} more hashtags for better discoverability",
                "impact": "-5%"
            })
        elif hashtag_count > max_hash:
            score -= 10
            feedback.append({
                "type": "error",
                "text": f"Too many hashtags may look spammy. Reduce to {max_hash}",
                "impact": "-10%"
            })
        
        # 4. Posting Time Analysis
        is_peak = any(start <= hour <= end for start, end in config["peak_hours"])
        if is_peak:
            score += 10
            feedback.append({
                "type": "success",
                "text": "Great posting time for maximum engagement",
                "impact": "+10%"
            })
        elif 0 <= hour <= 6:
            score -= 10
            feedback.append({
                "type": "error",
                "text": "Post during peak hours for 40% more engagement",
                "impact": "-10%"
            })
        
        # 5. Day of Week Analysis
        if day_of_week in config["best_days"]:
            score += 5
            feedback.append({
                "type": "success",
                "text": f"{day_of_week} is a high-engagement day for {platform}",
                "impact": "+5%"
            })
        
        # Clamp score to 0-100
        score = max(0, min(100, score))
        
        # Determine engagement level
        if score >= 80:
            engagement_level = "High"
        elif score >= 60:
            engagement_level = "Medium"
        else:
            engagement_level = "Low"
        
        # Generate predicted metrics (simulated)
        base_multiplier = score / 50
        predicted_reach = int(500 * base_multiplier + random.randint(100, 500))
        predicted_likes = int(50 * base_multiplier + random.randint(10, 50))
        predicted_comments = int(10 * base_multiplier + random.randint(2, 15))
        
        return {
            "score": score,
            "engagement_level": engagement_level,
            "feedback": feedback,
            "predicted_reach": predicted_reach,
            "predicted_likes": predicted_likes,
            "predicted_comments": predicted_comments
        }
