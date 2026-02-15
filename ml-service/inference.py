"""
EngagePredict - ML Inference Engine
Uses ensemble of Logistic Regression, Random Forest, and KNN
for social media engagement prediction.
"""

import numpy as np
import pickle
import os
import re
import random
from typing import Dict, List, Optional


class EngagementPredictor:
    """
    Ensemble ML predictor combining:
    - Multiclass Logistic Regression
    - Random Forest Classifier
    - K-Nearest Neighbors (KNN)
    
    Final prediction uses weighted voting from all 3 models.
    """

    def __init__(self):
        self.models_dir = os.path.join(os.path.dirname(__file__), "models")
        self.model_loaded = False

        # Model weights for ensemble (tuned based on accuracy)
        self.weights = {
            "logistic_regression": 0.30,
            "random_forest": 0.40,
            "knn": 0.30
        }

        # Platform-specific configurations
        self.platform_config = {
            "instagram": {
                "preferred_orientation": "Portrait",
                "optimal_caption_length": (100, 2200),
                "optimal_hashtag_count": (3, 30),
                "peak_hours": [9, 10, 12, 13, 19, 20],
                "best_days": ["Tuesday", "Wednesday", "Thursday"]
            },
            "tiktok": {
                "preferred_orientation": "Portrait",
                "optimal_caption_length": (50, 300),
                "optimal_hashtag_count": (3, 8),
                "peak_hours": [19, 20, 21, 22, 12, 13, 14],
                "best_days": ["Tuesday", "Thursday", "Friday"]
            },
            "youtube": {
                "preferred_orientation": "Landscape",
                "optimal_caption_length": (200, 5000),
                "optimal_hashtag_count": (3, 15),
                "peak_hours": [14, 15, 19, 20],
                "best_days": ["Friday", "Saturday", "Sunday"]
            },
            "twitter": {
                "preferred_orientation": "Any",
                "optimal_caption_length": (50, 280),
                "optimal_hashtag_count": (1, 3),
                "peak_hours": [8, 9, 12, 17],
                "best_days": ["Monday", "Tuesday", "Wednesday"]
            },
            "facebook": {
                "preferred_orientation": "Any",
                "optimal_caption_length": (40, 500),
                "optimal_hashtag_count": (1, 5),
                "peak_hours": [13, 14, 15, 19, 20],
                "best_days": ["Wednesday", "Thursday", "Friday"]
            }
        }

        self.platform_map = {
            "instagram": 0, "tiktok": 1, "youtube": 2,
            "twitter": 3, "facebook": 4
        }

        # Load trained models
        self._load_models()

    def _load_models(self):
        """Load all 3 trained ML models from disk."""
        try:
            with open(os.path.join(self.models_dir, "logistic_regression.pkl"), "rb") as f:
                self.lr_model = pickle.load(f)

            with open(os.path.join(self.models_dir, "random_forest.pkl"), "rb") as f:
                self.rf_model = pickle.load(f)

            with open(os.path.join(self.models_dir, "knn.pkl"), "rb") as f:
                self.knn_model = pickle.load(f)

            with open(os.path.join(self.models_dir, "scaler.pkl"), "rb") as f:
                self.scaler = pickle.load(f)

            with open(os.path.join(self.models_dir, "label_encoder.pkl"), "rb") as f:
                self.label_encoder = pickle.load(f)

            self.model_loaded = True
            print("[OK] All 3 ML models loaded successfully")
            print(f"   Models: Logistic Regression, Random Forest, KNN")
            print(f"   Classes: {list(self.label_encoder.classes_)}")

        except FileNotFoundError as e:
            print(f"[WARN] Model files not found: {e}")
            print("   Run 'python train_models.py' first to train models.")
            self.model_loaded = False

        except Exception as e:
            print(f"[ERROR] Error loading models: {e}")
            self.model_loaded = False

    def is_ready(self) -> bool:
        return self.model_loaded

    def _extract_features(
        self,
        caption: str,
        hashtags: str,
        platform: str,
        posting_time: str,
        day_of_week: str,
        media_info: Optional[Dict] = None
    ) -> np.ndarray:
        """
        Extract the 14 features expected by the trained models.
        """
        config = self.platform_config.get(platform, self.platform_config["instagram"])

        # Basic text features
        caption_length = len(caption)
        hashtag_matches = re.findall(r'#\w+', hashtags)
        hashtag_count = len(hashtag_matches)

        # Time features
        try:
            hour = int(posting_time.split(':')[0])
        except (ValueError, IndexError):
            hour = 12

        is_peak = 1 if hour in config["peak_hours"] else 0
        is_best_day = 1 if day_of_week in config["best_days"] else 0

        # Media features
        resolution_score = 3  # default: 1080p
        orientation_match = 1
        media_quality = 2     # default: High

        if media_info:
            # Resolution mapping
            res = media_info.get("resolution", "1080p")
            res_map = {"SD": 0, "480p": 1, "720p": 2, "1080p": 3, "4K": 4}
            resolution_score = res_map.get(res, 3)

            # Orientation match
            orientation = media_info.get("orientation", "")
            preferred = config["preferred_orientation"]
            if preferred == "Any":
                orientation_match = 1
            else:
                orientation_match = 1 if orientation == preferred else 0

            # Quality mapping
            quality = media_info.get("qualityScore", "High")
            quality_map = {"Low": 0, "Medium": 1, "High": 2}
            media_quality = quality_map.get(quality, 2)

        # Platform encoding
        platform_encoded = self.platform_map.get(platform, 0)

        # Additional text features
        has_location = 0  # Not always provided
        has_cta = 1 if any(
            word in caption.lower()
            for word in ["comment", "share", "like", "follow", "click", "link", "tag", "save", "check"]
        ) else 0
        has_emoji = 1 if re.search(r'[\U0001F600-\U0001F9FF]', caption) else 0

        # Ratios
        _, hash_max = config["optimal_hashtag_count"]
        _, cap_max = config["optimal_caption_length"]
        hashtag_ratio = hashtag_count / hash_max if hash_max > 0 else 0
        caption_ratio = caption_length / cap_max if cap_max > 0 else 0

        features = np.array([[
            caption_length, hashtag_count, hour, is_peak,
            is_best_day, resolution_score, orientation_match,
            media_quality, platform_encoded, has_location,
            has_cta, has_emoji, hashtag_ratio, caption_ratio
        ]])

        return features

    def _generate_feedback(
        self,
        caption: str,
        hashtags: str,
        platform: str,
        posting_time: str,
        day_of_week: str,
        media_info: Optional[Dict]
    ) -> List[Dict]:
        """Generate human-readable feedback based on content analysis."""
        feedback = []
        config = self.platform_config.get(platform, self.platform_config["instagram"])

        caption_length = len(caption)
        hashtag_count = len(re.findall(r'#\w+', hashtags))

        try:
            hour = int(posting_time.split(':')[0])
        except (ValueError, IndexError):
            hour = 12

        # Media quality feedback
        if media_info:
            resolution = media_info.get("resolution", "")
            orientation = media_info.get("orientation", "")
            preferred = config["preferred_orientation"]

            if resolution in ["4K", "1080p"]:
                feedback.append({
                    "type": "success",
                    "text": f"Excellent {resolution} resolution for maximum clarity",
                    "impact": "+15%"
                })
            elif resolution == "720p":
                feedback.append({
                    "type": "warning",
                    "text": "Consider 1080p for professional quality",
                    "impact": "+5%"
                })
            elif resolution in ["SD", "480p"]:
                feedback.append({
                    "type": "error",
                    "text": "Low resolution may reduce engagement",
                    "impact": "-10%"
                })

            if preferred != "Any":
                if orientation == preferred:
                    feedback.append({
                        "type": "success",
                        "text": f"{orientation} orientation is perfect for {platform}",
                        "impact": "+15%"
                    })
                else:
                    feedback.append({
                        "type": "error",
                        "text": f"Switch to {preferred} for higher reach on {platform}",
                        "impact": "-10%"
                    })

        # Caption feedback
        min_len, max_len = config["optimal_caption_length"]
        if min_len <= caption_length <= max_len:
            feedback.append({
                "type": "success",
                "text": "Caption length is optimized for engagement",
                "impact": "+10%"
            })
        elif caption_length < min_len:
            feedback.append({
                "type": "warning",
                "text": f"Add more context to your caption (aim for {min_len}+ characters)",
                "impact": "-5%"
            })
        else:
            feedback.append({
                "type": "warning",
                "text": "Consider shortening your caption for better readability",
                "impact": "-5%"
            })

        # Hashtag feedback
        min_hash, max_hash = config["optimal_hashtag_count"]
        if min_hash <= hashtag_count <= max_hash:
            feedback.append({
                "type": "success",
                "text": f"{hashtag_count} hashtags is within the optimal range",
                "impact": "+10%"
            })
        elif hashtag_count < min_hash:
            feedback.append({
                "type": "warning",
                "text": f"Add {min_hash - hashtag_count} more hashtags for better discoverability",
                "impact": "-5%"
            })
        else:
            feedback.append({
                "type": "error",
                "text": f"Too many hashtags may look spammy. Reduce to {max_hash}",
                "impact": "-10%"
            })

        # Time feedback
        is_peak = hour in config["peak_hours"]
        if is_peak:
            feedback.append({
                "type": "success",
                "text": "Great posting time for maximum engagement",
                "impact": "+10%"
            })
        elif 0 <= hour <= 6:
            feedback.append({
                "type": "error",
                "text": "Post during peak hours for more engagement",
                "impact": "-10%"
            })

        # Day feedback
        if day_of_week in config["best_days"]:
            feedback.append({
                "type": "success",
                "text": f"{day_of_week} is a high-engagement day for {platform}",
                "impact": "+5%"
            })

        return feedback

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
        Predict engagement using ensemble of 3 ML models.
        
        The final prediction combines:
        - Logistic Regression (30% weight)
        - Random Forest (40% weight)  
        - KNN (30% weight)
        """

        # Extract features
        features = self._extract_features(
            caption, hashtags, platform, posting_time, day_of_week, media_info
        )

        if self.model_loaded:
            # Scale features
            features_scaled = self.scaler.transform(features)

            # ─── Get predictions from all 3 models ──────────────
            
            # Logistic Regression - probability predictions
            lr_proba = self.lr_model.predict_proba(features_scaled)[0]
            
            # Random Forest - probability predictions
            rf_proba = self.rf_model.predict_proba(features_scaled)[0]
            
            # KNN - probability predictions
            knn_proba = self.knn_model.predict_proba(features_scaled)[0]

            # ─── Weighted Ensemble ──────────────────────────────
            ensemble_proba = (
                self.weights["logistic_regression"] * lr_proba +
                self.weights["random_forest"] * rf_proba +
                self.weights["knn"] * knn_proba
            )

            # Get predicted class
            predicted_class_idx = np.argmax(ensemble_proba)
            engagement_level = self.label_encoder.inverse_transform([predicted_class_idx])[0]
            confidence = float(ensemble_proba[predicted_class_idx])

            # Convert class probabilities to a score (0-100)
            # Map: Low=0-49, Medium=50-74, High=75-100
            class_names = list(self.label_encoder.classes_)
            low_idx = class_names.index("Low")
            med_idx = class_names.index("Medium")
            high_idx = class_names.index("High")

            score = (
                ensemble_proba[low_idx] * 25 +
                ensemble_proba[med_idx] * 62 +
                ensemble_proba[high_idx] * 95
            )
            score = int(max(0, min(100, score)))

            # Individual model predictions for transparency
            lr_class = self.label_encoder.inverse_transform([np.argmax(lr_proba)])[0]
            rf_class = self.label_encoder.inverse_transform([np.argmax(rf_proba)])[0]
            knn_class = self.label_encoder.inverse_transform([np.argmax(knn_proba)])[0]

            print(f"\n[PREDICTION] Details:")
            print(f"   Logistic Regression -> {lr_class} (conf: {max(lr_proba):.2f})")
            print(f"   Random Forest       -> {rf_class} (conf: {max(rf_proba):.2f})")
            print(f"   KNN                 -> {knn_class} (conf: {max(knn_proba):.2f})")
            print(f"   Ensemble Result     -> {engagement_level} (score: {score})")

        else:
            # Fallback: rule-based scoring if models not loaded
            print("[WARN] Using fallback rule-based scoring (models not loaded)")
            score = self._fallback_score(
                caption, hashtags, platform, posting_time, day_of_week, media_info
            )
            if score >= 75:
                engagement_level = "High"
            elif score >= 50:
                engagement_level = "Medium"
            else:
                engagement_level = "Low"

        # Generate feedback
        feedback = self._generate_feedback(
            caption, hashtags, platform, posting_time, day_of_week, media_info
        )

        # Predicted metrics based on score
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

    def _fallback_score(
        self, caption, hashtags, platform, posting_time, day_of_week, media_info
    ) -> int:
        """Fallback rule-based scoring when ML models are unavailable."""
        score = 50
        config = self.platform_config.get(platform, self.platform_config["instagram"])

        caption_length = len(caption)
        hashtag_count = len(re.findall(r'#\w+', hashtags))

        try:
            hour = int(posting_time.split(':')[0])
        except:
            hour = 12

        # Media
        if media_info:
            res = media_info.get("resolution", "")
            if res in ["4K", "1080p"]:
                score += 15
            elif res == "720p":
                score += 5
            elif res in ["SD", "480p"]:
                score -= 10

            orientation = media_info.get("orientation", "")
            preferred = config["preferred_orientation"]
            if preferred != "Any":
                score += 15 if orientation == preferred else -10

        # Caption
        min_len, max_len = config["optimal_caption_length"]
        if min_len <= caption_length <= max_len:
            score += 10
        else:
            score -= 5

        # Hashtags
        min_h, max_h = config["optimal_hashtag_count"]
        if min_h <= hashtag_count <= max_h:
            score += 10
        else:
            score -= 5

        # Time
        if hour in config["peak_hours"]:
            score += 10
        if day_of_week in config["best_days"]:
            score += 5

        return max(0, min(100, score))
