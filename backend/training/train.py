import pandas as pd
import numpy as np
import joblib
import os
from pathlib import Path

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score
from sklearn.preprocessing import LabelEncoder

from sklearn.ensemble import RandomForestClassifier

from preprocess import (
    normalize_columns,
    add_engineered_features,
    select_feature_columns,
    fit_feature_artifact,
)

BASE_DIR = Path(__file__).resolve().parent
DATASETS_DIR = (BASE_DIR / ".." / "datasets").resolve()
MODELS_DIR = (BASE_DIR / ".." / "models").resolve()

# ==========================================
# LOAD DATASETS
# ==========================================

sleep_df = pd.read_csv(
    DATASETS_DIR / 'sleep_dataset.csv'
)

anxiety_df = pd.read_csv(
    DATASETS_DIR / 'anxiety_dataset.csv'
)

depression_df = pd.read_csv(
    DATASETS_DIR / 'depression_dataset.csv'
)

# ==========================================
# PREPROCESS DATASETS (NORMALIZE + ENGINEER)
# ==========================================

sleep_df = add_engineered_features(normalize_columns(sleep_df))
anxiety_df = add_engineered_features(normalize_columns(anxiety_df))
depression_df = add_engineered_features(normalize_columns(depression_df))

# ==========================================
# TARGET COLUMNS
# ==========================================

sleep_target = 'sleep_disorder'

anxiety_target = 'anxiety_score'

depression_target = 'depression_severity'

# ==========================================
# CONVERT ANXIETY SCORE TO CLASSES
# ==========================================

def score_to_category(score):

    try:

        score = float(score)

        if score <= 3:
            return 0

        elif score <= 6:
            return 1

        else:
            return 2

    except:
        return 1

# Convert anxiety numeric score into classes
if anxiety_target in anxiety_df.columns:

    anxiety_df[anxiety_target] = (
        anxiety_df[anxiety_target]
        .apply(score_to_category)
    )

# ==========================================
# CLEAN + ENCODE DEPRESSION LABELS
# ==========================================

if depression_target in depression_df.columns:
    depression_df[depression_target] = (
        depression_df[depression_target]
        .astype(str)
        .str.strip()
        .str.lower()
    )
    depression_df = depression_df[
        depression_df[depression_target].isin(
            ['none-minimal', 'mild', 'moderate', 'moderately severe', 'severe']
        )
    ].copy()

    depression_order = {
        'none-minimal': 0,
        'mild': 1,
        'moderate': 2,
        'moderately severe': 3,
        'severe': 4,
    }

    depression_df[depression_target] = (
        depression_df[depression_target]
        .map(depression_order)
    )

# ==========================================
# TRAIN FUNCTION
# ==========================================

def train_model(df, target_col, model_name):

    print(f'\nTraining target: {target_col} ({model_name})')

    feature_cols = select_feature_columns(df, target_col)
    X, encoders, fill_values, categorical_cols = fit_feature_artifact(df, feature_cols)

    target_labels = {}
    if model_name == 'sleep':
        raw = df[target_col].astype(str).str.strip().str.lower()
        raw = raw.replace({'none': 'normal', 'nan': 'normal', '': 'normal'})
        sleep_order = ['normal', 'insomnia', 'sleep apnea']
        sleep_map = {label: idx for idx, label in enumerate(sleep_order)}
        y = raw.map(sleep_map)
        valid = y.notna()
        X = X.loc[valid]
        y = y.loc[valid].astype(int)
        target_labels = {idx: label.title() for label, idx in sleep_map.items()}
    elif model_name == 'anxiety':
        y = pd.to_numeric(df[target_col], errors='coerce').fillna(1).astype(int)
        target_labels = {0: 'Low', 1: 'Moderate', 2: 'High'}
    elif model_name == 'depression':
        y = pd.to_numeric(df[target_col], errors='coerce')
        valid = y.notna()
        X = X.loc[valid]
        y = y.loc[valid].astype(int)
        target_labels = {
            0: 'None-Minimal',
            1: 'Mild',
            2: 'Moderate',
            3: 'Moderately Severe',
            4: 'Severe',
        }
    else:
        le = LabelEncoder()
        y = le.fit_transform(df[target_col].astype(str))
        target_labels = {int(i): str(c) for i, c in enumerate(le.classes_)}

    # ======================================
    # TRAIN TEST SPLIT
    # ======================================

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=42
    )

    # ======================================
    # SCALER
    # ======================================

    scaler = StandardScaler()

    X_train_scaled = scaler.fit_transform(
        X_train
    )

    X_test_scaled = scaler.transform(
        X_test
    )

    # ======================================
    # MODEL
    # ======================================

    model = RandomForestClassifier(
        n_estimators=300,
        max_depth=12,
        random_state=42
    )

    # ======================================
    # TRAIN MODEL
    # ======================================

    model.fit(
        X_train_scaled,
        y_train
    )

    # ======================================
    # PREDICTIONS
    # ======================================

    preds = model.predict(
        X_test_scaled
    )

    # ======================================
    # ACCURACY
    # ======================================

    accuracy = accuracy_score(
        y_test,
        preds
    )

    print(f'Accuracy: {accuracy}')

    artifact = {
        'name': model_name,
        'target_col': target_col,
        'feature_cols': feature_cols,
        'categorical_cols': categorical_cols,
        'encoders': encoders,
        'fill_values': fill_values,
        'scaler': scaler,
        'model': model,
        'classes': list(model.classes_),
        'target_labels': target_labels,
    }

    return artifact

# ==========================================
# TRAIN SLEEP MODEL
# ==========================================

print('\nTraining Sleep Model...')

sleep_artifact = train_model(
    sleep_df,
    sleep_target,
    'sleep'
)

# ==========================================
# TRAIN ANXIETY MODEL
# ==========================================

print('\nTraining Anxiety Model...')

anxiety_artifact = train_model(
    anxiety_df,
    anxiety_target,
    'anxiety'
)

# ==========================================
# TRAIN DEPRESSION MODEL
# ==========================================

print('\nTraining Depression Model...')

depression_artifact = train_model(
    depression_df,
    depression_target,
    'depression'
)

# ==========================================
# CREATE MODELS FOLDER
# ==========================================

os.makedirs(
    MODELS_DIR,
    exist_ok=True
)

# ==========================================
# SAVE MODELS
# ==========================================

joblib.dump(
    sleep_artifact,
    MODELS_DIR / 'sleep_artifact.pkl'
)

joblib.dump(
    anxiety_artifact,
    MODELS_DIR / 'anxiety_artifact.pkl'
)

joblib.dump(
    depression_artifact,
    MODELS_DIR / 'depression_artifact.pkl'
)

print('\n====================================')
print('ALL MODELS SAVED SUCCESSFULLY!') 
print('====================================') 