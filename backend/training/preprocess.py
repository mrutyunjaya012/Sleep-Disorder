import numpy as np
import pandas as pd
from sklearn.preprocessing import LabelEncoder

USER_DEFAULTS = {
    "age": 25,
    "gender": "male",
    "height": 170.0,
    "weight": 70.0,
    "bmi": 24.0,
    "sleep_duration": 7.0,
    "sleep_quality": 6.0,
    "bedtime_regularity": 5.0,
    "night_awakenings": 1.0,
    "stress_level": 5.0,
    "anxiety_score": 5.0,
    "mood_score": 5.0,
    "physical_activity": 30.0,
    "screen_time": 4.0,
    "social_media": 3.0,
    "caffeine": 2.0,
    "social_support": 5.0,
    "alcohol_use": "never",
    "smoking": "never",
    "diet_quality": "balanced",
    "resting_heart_rate": 72.0,
    "heart_rate_variability": 50.0,
    "spo2": 98.0,
    "daily_steps": 6000.0,
}

ALIASES = {
    "quality_of_sleep": "sleep_quality",
    "sleep_hours": "sleep_duration",
    "physical_activity_level": "physical_activity",
    "physical_activity_hrs": "physical_activity",
    "social_support_score": "social_support",
    "heart_rate": "resting_heart_rate",
}


def normalize_columns(df: pd.DataFrame) -> pd.DataFrame:
    out = df.copy()
    out.columns = [str(col).strip().lower().replace(" ", "_") for col in out.columns]
    out = out.rename(columns=ALIASES)
    return out


def add_engineered_features(df: pd.DataFrame) -> pd.DataFrame:
    out = df.copy()
    if {"weight", "height"}.issubset(out.columns):
        height_m = pd.to_numeric(out["height"], errors="coerce") / 100.0
        safe_height = height_m.where(height_m > 0, np.nan)
        out["calculated_bmi"] = pd.to_numeric(out["weight"], errors="coerce") / (safe_height**2)
    if {"sleep_quality", "bedtime_regularity", "night_awakenings"}.issubset(out.columns):
        out["sleep_health_score"] = (
            pd.to_numeric(out["sleep_quality"], errors="coerce") * 2
            + pd.to_numeric(out["bedtime_regularity"], errors="coerce")
            - pd.to_numeric(out["night_awakenings"], errors="coerce")
        )
    if {"stress_level", "anxiety_score", "mood_score"}.issubset(out.columns):
        out["mental_stress_index"] = (
            pd.to_numeric(out["stress_level"], errors="coerce")
            + pd.to_numeric(out["anxiety_score"], errors="coerce")
            - pd.to_numeric(out["mood_score"], errors="coerce")
        )
    return out


def select_feature_columns(df: pd.DataFrame, target_col: str) -> list:
    preferred = [c for c in USER_DEFAULTS if c in df.columns and c != target_col]
    engineered = [c for c in ["calculated_bmi", "sleep_health_score", "mental_stress_index"] if c in df.columns]
    cols = preferred + [c for c in engineered if c not in preferred]
    return cols


def fit_feature_artifact(df: pd.DataFrame, feature_cols: list) -> tuple:
    work = df.copy()

    for col in feature_cols:
        if col not in work.columns:
            work[col] = USER_DEFAULTS.get(col, 0)

    X = work[feature_cols].copy()
    categorical_cols = X.select_dtypes(include=["object"]).columns.tolist()

    encoders = {}
    fill_values = {}

    for col in X.columns:
        if col in categorical_cols:
            series = X[col].astype(str).str.strip().str.lower()
            default_val = str(USER_DEFAULTS.get(col, "unknown")).strip().lower()
            mode = series.mode()
            fill_val = mode.iloc[0] if not mode.empty else default_val
            X[col] = series.fillna(fill_val)
            fill_values[col] = fill_val

            le = LabelEncoder()
            X[col] = le.fit_transform(X[col].astype(str))
            encoders[col] = le
        else:
            num = pd.to_numeric(X[col], errors="coerce")
            fallback = float(USER_DEFAULTS.get(col, 0.0))
            median = float(num.median()) if not np.isnan(num.median()) else fallback
            X[col] = num.fillna(median)
            fill_values[col] = median

    return X, encoders, fill_values, categorical_cols


def transform_with_artifact(df: pd.DataFrame, artifact: dict) -> pd.DataFrame:
    work = normalize_columns(df)
    work = add_engineered_features(work)

    feature_cols = artifact["feature_cols"]
    encoders = artifact["encoders"]
    fill_values = artifact["fill_values"]
    categorical_cols = artifact["categorical_cols"]

    for col in feature_cols:
        if col not in work.columns:
            work[col] = USER_DEFAULTS.get(col, 0)

    X = work[feature_cols].copy()

    for col in X.columns:
        if col in categorical_cols:
            series = X[col].astype(str).str.strip().str.lower()
            fill_val = str(fill_values[col])
            series = series.fillna(fill_val)
            le = encoders[col]
            known_classes = set(le.classes_)
            # Deterministic fallback for unseen categories.
            series = series.apply(lambda v: v if v in known_classes else fill_val)
            X[col] = le.transform(series.astype(str))
        else:
            num = pd.to_numeric(X[col], errors="coerce")
            X[col] = num.fillna(float(fill_values[col]))

    return X