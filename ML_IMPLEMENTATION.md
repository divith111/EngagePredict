# Machine Learning Implementation in EngagePredict

The EngagePredict project leverages a robust Machine Learning pipeline to analyze user behavior, predict engagement tiers, and forecast churn probability. This document details the step-by-step implementation of the ML models within our system.

## Overview

The core of our ML predictive engine is implemented in `train_models.py` and relies on a combination of unsupervised and supervised learning algorithms to extract insights from the `engage_predict_dataset.csv`.

The ML workflow operates in five main stages:
1. Data Preprocessing
2. Dimensionality Reduction
3. User Segmentation
4. Engagement Tier Classification
5. Churn Probability Regression

---

## 1. Data Preprocessing

Before feeding data into the models, it must be cleaned and standardized. We use two primary transformers from `scikit-learn`:

- **Label Encoding**: The `LabelEncoder` is used to convert categorical features (like `device_type`) into numerical format so that the algorithms can process them.
- **Feature Scaling**: We apply the `StandardScaler` to standardize the features by removing the mean and scaling to unit variance. This step is critical because algorithms like PCA and K-Means are distance-based and highly sensitive to unscaled data.

## 2. Dimensionality Reduction (PCA)

We implement **Principal Component Analysis (PCA)** to reduce the complexity of the dataset while retaining the majority of its variance. 

- **Implementation**: The data is reduced down to 3 principal components (`n_components=3`). 
- **Purpose**: This reduces the computational overhead, helps in noise reduction, and significantly accelerates the training of downstream models without sacrificing critical information.

## 3. User Segmentation (K-Means Clustering)

To understand user behavior patterns organically, an unsupervised learning approach is utilized.

- **Implementation**: We employ the **K-Means** algorithm (`n_clusters=3`) on the PCA-reduced features.
- **Purpose**: This segments the user base into distinct behavioral groups (clusters). These clusters provide valuable insights into distinct user personas, which can be utilized for targeted marketing or tailored recommendations.

## 4. Engagement Tier Classification (Random Forest)

To predict how engaged a user will be (categorized into tiers such as Low, Medium, High), we use a supervised classification model.

- **Implementation**: A **Random Forest Classifier** is trained using the PCA-reduced data as inputs and the `engagement_tier` as the target variable.
- **Purpose**: Random forests are robust against overfitting and capable of capturing complex, non-linear relationships. It serves as the primary predictive engine for determining a user's engagement level on the platform.

## 5. Churn Probability Regression (XGBoost)

Alongside predicting engagement, the system forecasts the likelihood of a user abandoning the platform (churn).

- **Implementation**: We use an **XGBoost Regressor** (`objective='reg:squarederror'`) trained on the same PCA features, with the target being `churn_probability`.
- **Purpose**: XGBoost (Extreme Gradient Boosting) is highly efficient and provides state-of-the-art predictive performance for tabular data. It gives us a continuous output indicating the exact probability of user churn, enabling proactive retention strategies.

---

## Model Pipeline & Persistence

Once the entire pipeline is trained:
1. **Serialization**: The fitted standard scaler, PCA transformer, K-Means model, Random Forest classifier, and XGBoost regressor are explicitly saved using `joblib` into the `models/` directory.
2. **Inference**: During production inference (inside the `ml-service`), these pre-trained components are loaded into memory. When new user data arrives, the exact same preprocessing and PCA transformations are applied before passing it to the predictive models for real-time predictions.
