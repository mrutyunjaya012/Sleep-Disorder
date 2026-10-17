from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import pandas as pd
import numpy as np
import joblib
from pathlib import Path
import sys

# ==========================================
# CREATE FASTAPI APP
# ==========================================

app = FastAPI()

# ==========================================
# ENABLE CORS
# ==========================================

app.add_middleware(
    CORSMiddleware,

    allow_origins=["*"],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],
)

# ==========================================
# LOAD MODELS
# ==========================================

BASE_DIR = Path(__file__).resolve().parent
MODELS_DIR = (BASE_DIR / ".." / "models").resolve()
TRAINING_DIR = (BASE_DIR / ".." / "training").resolve()

# Reuse the exact preprocessing used during training.
# (backend/training is not a package, so we add it to sys.path.)
sys.path.append(str(TRAINING_DIR))
from preprocess import transform_with_artifact  # noqa: E402

sleep_artifact = joblib.load(MODELS_DIR / "sleep_artifact.pkl")
anxiety_artifact = joblib.load(MODELS_DIR / "anxiety_artifact.pkl")
depression_artifact = joblib.load(MODELS_DIR / "depression_artifact.pkl")

# ==========================================
# REQUEST BODY
# ==========================================

class PredictionInput(BaseModel):

    age: int
    gender: str

    height: float
    weight: float
    bmi: float

    sleep_duration: float
    sleep_quality: int
    bedtime_regularity: int
    night_awakenings: int

    stress_level: int
    anxiety_score: int
    mood_score: int

    physical_activity: int
    screen_time: int
    social_media: int
    caffeine: int
    social_support: int

    alcohol_use: str
    smoking: str
    diet_quality: str

    resting_heart_rate: int
    heart_rate_variability: int
    spo2: int
    daily_steps: int

# ==========================================
# HEALTH CHECK
# ==========================================

@app.get("/")
def home():

    return {
        "message": "Mind Insight Prediction API Running"
    }

# ==========================================
# HELPER FUNCTION
# ==========================================

def predict_from_artifact(input_df: pd.DataFrame, artifact: dict):
    features = transform_with_artifact(input_df, artifact)
    scaled = artifact["scaler"].transform(features)
    model = artifact["model"]
    pred = int(model.predict(scaled)[0])
    probs = model.predict_proba(scaled)[0]
    confidence = round(float(max(probs)) * 100, 2)
    classes = [int(c) for c in model.classes_]
    return pred, probs, confidence, classes


def get_label_from_artifact(artifact: dict, pred: int, fallback: str = "Unknown") -> str:
    labels = artifact.get("target_labels", {})
    return labels.get(int(pred), fallback)

def bucket_label(score: float) -> str:
    if score < 33.34:
        return "Low"
    if score < 66.67:
        return "Moderate"
    return "High"

# ==========================================
# PREDICTION ROUTE
# ==========================================

@app.post("/predict")
def predict(data: PredictionInput):

    # ======================================
    # CONVERT INPUT TO DATAFRAME
    # ======================================

    input_df = pd.DataFrame([data.dict()])

    # ======================================
    # SLEEP PREDICTION
    # ======================================

    sleep_pred, sleep_probs, sleep_confidence, sleep_classes = predict_from_artifact(
        input_df,
        sleep_artifact,
    )
    # Risk is probability of any disorder (class != 0),
    # computed using real model class IDs.
    normal_prob = 0.0
    for cls, prob in zip(sleep_classes, sleep_probs):
        if cls == 0:
            normal_prob = float(prob)
            break
    sleep_risk = round(
        (1 - normal_prob) * 100,
        2
    )

    # ======================================
    # ANXIETY PREDICTION
    # ======================================

    _, anxiety_probs, anxiety_confidence, _ = predict_from_artifact(
        input_df,
        anxiety_artifact,
    )
    # Severity-weighted risk (0..2 classes => 0..100 score).
    anxiety_indices = np.arange(len(anxiety_probs))
    anxiety_risk = round(
        float(np.dot(anxiety_probs, anxiety_indices) / max(len(anxiety_probs) - 1, 1) * 100),
        2
    )

    # ======================================
    # DEPRESSION PREDICTION
    # ======================================

    _, depression_probs, depression_confidence, _ = predict_from_artifact(
        input_df,
        depression_artifact,
    )
    # Depression model has 7 classes; risk should reflect severity,
    # not confidence of the top class.
    depression_indices = np.arange(len(depression_probs))
    depression_risk = round(
        float(np.dot(depression_probs, depression_indices) / max(len(depression_probs) - 1, 1) * 100),
        2
    )

    # ======================================
    # RESPONSE
    # ======================================

    return {

        "sleep_disorder": {

            "prediction": get_label_from_artifact(
                sleep_artifact,
                sleep_pred,
            ),

            "risk": sleep_risk,

            "confidence": sleep_confidence
        },

        "anxiety": {

            "prediction": bucket_label(anxiety_risk),

            "risk": anxiety_risk,

            "confidence": anxiety_confidence
        },

        "depression": {

            "prediction": bucket_label(depression_risk),

            "risk": depression_risk,

            "confidence": depression_confidence
        }
    }