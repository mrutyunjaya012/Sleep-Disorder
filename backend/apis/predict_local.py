import json
from pathlib import Path

import joblib
import pandas as pd


def main() -> None:
    base_dir = Path(__file__).resolve().parent
    models_dir = (base_dir / ".." / "models").resolve()
    training_dir = (base_dir / ".." / "training").resolve()

    import sys

    sys.path.append(str(training_dir))
    from preprocess import transform_with_artifact  # type: ignore

    sleep_artifact = joblib.load(models_dir / "sleep_artifact.pkl")
    anxiety_artifact = joblib.load(models_dir / "anxiety_artifact.pkl")
    depression_artifact = joblib.load(models_dir / "depression_artifact.pkl")

    sample_input = {
        "age": 21,
        "gender": "male",
        "height": 170.0,
        "weight": 65.0,
        "bmi": 22.5,
        "sleep_duration": 6.0,
        "sleep_quality": 6,
        "bedtime_regularity": 5,
        "night_awakenings": 1,
        "stress_level": 6,
        "anxiety_score": 5,
        "mood_score": 6,
        "physical_activity": 30,
        "screen_time": 5,
        "social_media": 3,
        "caffeine": 2,
        "social_support": 6,
        "alcohol_use": "occasionally",
        "smoking": "never",
        "diet_quality": "balanced",
        "resting_heart_rate": 72,
        "heart_rate_variability": 55,
        "spo2": 98,
        "daily_steps": 6500,
    }

    df = pd.DataFrame([sample_input])

    def predict_with_artifact(artifact: dict):
        X = transform_with_artifact(df, artifact)
        scaled = artifact["scaler"].transform(X)
        model = artifact["model"]
        pred = int(model.predict(scaled)[0])
        proba = model.predict_proba(scaled)[0].tolist()
        return pred, proba

    sleep_pred, sleep_proba = predict_with_artifact(sleep_artifact)
    anxiety_pred, anxiety_proba = predict_with_artifact(anxiety_artifact)
    depression_pred, depression_proba = predict_with_artifact(depression_artifact)
    out = {
        "sleep_disorder": sleep_pred,
        "sleep_disorder_proba": sleep_proba,
        "anxiety": anxiety_pred,
        "anxiety_proba": anxiety_proba,
        "depression": depression_pred,
        "depression_proba": depression_proba,
    }

    print(json.dumps(out, indent=2))


if __name__ == "__main__":
    main()

