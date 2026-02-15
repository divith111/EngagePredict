"""
EngagePredict - ML Model Training Script
Trains Multiclass Logistic Regression, Random Forest Classifier, and KNN
for social media engagement prediction (High / Medium / Low).
"""

import numpy as np
import pandas as pd
import pickle
import os
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.metrics import classification_report, accuracy_score


# ─── Feature Names ───────────────────────────────────────────────
FEATURE_NAMES = [
    "caption_length",        # Number of characters in caption
    "hashtag_count",         # Number of hashtags used
    "posting_hour",          # Hour of day (0-23)
    "is_peak_hour",          # 1 if posting during peak hours
    "is_best_day",           # 1 if posting on a high-engagement day
    "resolution_score",      # 0=SD, 1=480p, 2=720p, 3=1080p, 4=4K
    "orientation_match",     # 1 if orientation matches platform preference
    "media_quality",         # 0=Low, 1=Medium, 2=High
    "platform_encoded",      # 0=instagram, 1=tiktok, 2=youtube, 3=twitter, 4=facebook
    "has_location",          # 1 if location tag is present
    "caption_has_cta",       # 1 if caption has a call-to-action
    "caption_has_emoji",     # 1 if caption contains emojis
    "hashtag_ratio",         # hashtag_count / optimal_max (0.0 to 1.0+)
    "caption_ratio",         # caption_length / optimal_max (0.0 to 1.0+)
]

# Engagement classes
CLASSES = ["Low", "Medium", "High"]


def generate_synthetic_data(n_samples=5000):
    """
    Generate realistic synthetic social media engagement data.
    Features are designed to reflect real-world patterns where
    certain combinations of features lead to higher engagement.
    """
    np.random.seed(42)
    data = []

    for _ in range(n_samples):
        platform = np.random.choice([0, 1, 2, 3, 4])  # ig, tiktok, yt, twitter, fb

        # Platform-specific optimal ranges
        platform_configs = {
            0: {"cap_range": (100, 2200), "hash_range": (3, 30), "peaks": [9,10,12,13,19,20]},
            1: {"cap_range": (50, 300),   "hash_range": (3, 8),  "peaks": [19,20,21,22,12,13,14]},
            2: {"cap_range": (200, 5000), "hash_range": (3, 15), "peaks": [14,15,19,20]},
            3: {"cap_range": (50, 280),   "hash_range": (1, 3),  "peaks": [8,9,12,17]},
            4: {"cap_range": (40, 500),   "hash_range": (1, 5),  "peaks": [13,14,15,19,20]},
        }
        config = platform_configs[platform]

        # Generate features with realistic distributions
        caption_length = int(np.random.exponential(300) + 10)
        caption_length = min(caption_length, 5000)

        hashtag_count = int(np.random.exponential(5))
        hashtag_count = min(hashtag_count, 50)

        posting_hour = np.random.randint(0, 24)
        is_peak = 1 if posting_hour in config["peaks"] else 0
        is_best_day = np.random.choice([0, 1], p=[0.4, 0.6])

        resolution_score = np.random.choice([0, 1, 2, 3, 4], p=[0.05, 0.10, 0.20, 0.45, 0.20])
        orientation_match = np.random.choice([0, 1], p=[0.35, 0.65])
        media_quality = np.random.choice([0, 1, 2], p=[0.15, 0.30, 0.55])

        has_location = np.random.choice([0, 1], p=[0.5, 0.5])
        has_cta = np.random.choice([0, 1], p=[0.6, 0.4])
        has_emoji = np.random.choice([0, 1], p=[0.4, 0.6])

        # Calculate ratios
        cap_min, cap_max = config["cap_range"]
        hash_min, hash_max = config["hash_range"]
        hashtag_ratio = hashtag_count / hash_max if hash_max > 0 else 0
        caption_ratio = caption_length / cap_max if cap_max > 0 else 0

        # ─── Engagement Score Calculation (ground truth) ─────────
        score = 50.0

        # Resolution impact
        score += [-10, -5, 5, 15, 20][resolution_score]

        # Orientation match
        score += 15 if orientation_match else -10

        # Caption length fit
        if cap_min <= caption_length <= cap_max:
            score += 10
        elif caption_length < cap_min * 0.5:
            score -= 10
        elif caption_length < cap_min:
            score -= 5
        elif caption_length > cap_max * 1.5:
            score -= 10
        else:
            score -= 3

        # Hashtag fit
        if hash_min <= hashtag_count <= hash_max:
            score += 10
        elif hashtag_count < hash_min:
            score -= 5
        elif hashtag_count > hash_max * 1.5:
            score -= 15
        else:
            score -= 5

        # Time and day
        score += 10 if is_peak else -5
        score += 5 if is_best_day else 0

        # Media quality
        score += [-8, 3, 10][media_quality]

        # Extra features
        score += 3 if has_location else 0
        score += 5 if has_cta else 0
        score += 2 if has_emoji else 0

        # Add noise to simulate real-world variability
        score += np.random.normal(0, 8)

        # Clamp
        score = max(0, min(100, score))

        # Classify
        if score >= 75:
            label = "High"
        elif score >= 50:
            label = "Medium"
        else:
            label = "Low"

        data.append([
            caption_length, hashtag_count, posting_hour, is_peak,
            is_best_day, resolution_score, orientation_match,
            media_quality, platform, has_location, has_cta,
            has_emoji, hashtag_ratio, caption_ratio, label
        ])

    columns = FEATURE_NAMES + ["engagement_level"]
    df = pd.DataFrame(data, columns=columns)
    return df


def train_and_save_models():
    """
    Train all 3 ML models and save them to the models/ directory.
    """
    print("=" * 60)
    print("  EngagePredict - ML Model Training")
    print("=" * 60)

    # Generate data
    print("\n[DATA] Generating synthetic training data...")
    df = generate_synthetic_data(n_samples=8000)

    print(f"   Dataset size: {len(df)} samples")
    print(f"   Class distribution:")
    for cls in CLASSES:
        count = len(df[df["engagement_level"] == cls])
        print(f"     {cls}: {count} ({count/len(df)*100:.1f}%)")

    # Prepare features and labels
    X = df[FEATURE_NAMES].values
    y = df["engagement_level"].values

    # Encode labels
    label_encoder = LabelEncoder()
    y_encoded = label_encoder.fit_transform(y)

    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
    )

    # Scale features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    print(f"\n   Train set: {len(X_train)} | Test set: {len(X_test)}")

    # ─── Model 1: Multiclass Logistic Regression ────────────────
    print("\n[MODEL 1] Training Multiclass Logistic Regression...")
    lr_model = LogisticRegression(
        solver="lbfgs",
        max_iter=1000,
        C=1.0,
        random_state=42
    )
    lr_model.fit(X_train_scaled, y_train)
    lr_pred = lr_model.predict(X_test_scaled)
    lr_acc = accuracy_score(y_test, lr_pred)
    print(f"   Accuracy: {lr_acc:.4f}")
    print(classification_report(y_test, lr_pred, target_names=label_encoder.classes_))

    # ─── Model 2: Random Forest Classifier ──────────────────────
    print("[MODEL 2] Training Random Forest Classifier...")
    rf_model = RandomForestClassifier(
        n_estimators=100,
        max_depth=12,
        min_samples_split=5,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=-1
    )
    rf_model.fit(X_train_scaled, y_train)
    rf_pred = rf_model.predict(X_test_scaled)
    rf_acc = accuracy_score(y_test, rf_pred)
    print(f"   Accuracy: {rf_acc:.4f}")
    print(classification_report(y_test, rf_pred, target_names=label_encoder.classes_))

    # ─── Model 3: K-Nearest Neighbors ───────────────────────────
    print("[MODEL 3] Training KNN Classifier...")
    knn_model = KNeighborsClassifier(
        n_neighbors=7,
        weights="distance",
        metric="minkowski",
        p=2
    )
    knn_model.fit(X_train_scaled, y_train)
    knn_pred = knn_model.predict(X_test_scaled)
    knn_acc = accuracy_score(y_test, knn_pred)
    print(f"   Accuracy: {knn_acc:.4f}")
    print(classification_report(y_test, knn_pred, target_names=label_encoder.classes_))

    # ─── Save Models ────────────────────────────────────────────
    models_dir = os.path.join(os.path.dirname(__file__), "models")
    os.makedirs(models_dir, exist_ok=True)

    with open(os.path.join(models_dir, "logistic_regression.pkl"), "wb") as f:
        pickle.dump(lr_model, f)
    print("\n[SAVED] logistic_regression.pkl")

    with open(os.path.join(models_dir, "random_forest.pkl"), "wb") as f:
        pickle.dump(rf_model, f)
    print("[SAVED] random_forest.pkl")

    with open(os.path.join(models_dir, "knn.pkl"), "wb") as f:
        pickle.dump(knn_model, f)
    print("[SAVED] knn.pkl")

    with open(os.path.join(models_dir, "scaler.pkl"), "wb") as f:
        pickle.dump(scaler, f)
    print("[SAVED] scaler.pkl")

    with open(os.path.join(models_dir, "label_encoder.pkl"), "wb") as f:
        pickle.dump(label_encoder, f)
    print("[SAVED] label_encoder.pkl")

    # Save feature names for reference
    with open(os.path.join(models_dir, "feature_names.pkl"), "wb") as f:
        pickle.dump(FEATURE_NAMES, f)
    print("[SAVED] feature_names.pkl")

    # ─── Summary ────────────────────────────────────────────────
    print("\n" + "=" * 60)
    print("  Training Summary")
    print("=" * 60)
    print(f"  Logistic Regression : {lr_acc:.4f}")
    print(f"  Random Forest       : {rf_acc:.4f}")
    print(f"  KNN                 : {knn_acc:.4f}")
    print(f"  Best Model          : ", end="")
    best = max([("Logistic Regression", lr_acc), ("Random Forest", rf_acc), ("KNN", knn_acc)], key=lambda x: x[1])
    print(f"{best[0]} ({best[1]:.4f})")
    print("=" * 60)


if __name__ == "__main__":
    train_and_save_models()
