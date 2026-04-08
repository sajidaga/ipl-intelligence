"""
Train ML models for IPL predictions.
Run this script once to train and save models to saved_models/.

Usage:
    python -m ml.train
"""

import os
import pickle
import numpy as np
from sklearn.ensemble import RandomForestClassifier, GradientBoostingRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, mean_absolute_error

MODELS_DIR = os.path.join(os.path.dirname(__file__), "saved_models")


def ensure_models_dir():
    """Create the saved_models directory if it doesn't exist."""
    os.makedirs(MODELS_DIR, exist_ok=True)


def train_match_winner_model():
    """
    Train a model to predict match winners.
    Replace the synthetic data below with real IPL data from your database.
    """
    print("Training match winner model...")

    # TODO: Replace with real data from database
    # Features: [home_team_strength, away_team_strength, venue_factor, head_to_head_ratio, toss_advantage]
    np.random.seed(42)
    n_samples = 1000
    X = np.random.rand(n_samples, 5)
    y = (X[:, 0] * 0.3 + X[:, 3] * 0.3 + X[:, 4] * 0.2 + np.random.rand(n_samples) * 0.2 > 0.5).astype(int)

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)

    accuracy = accuracy_score(y_test, model.predict(X_test))
    print(f"  Match Winner Model Accuracy: {accuracy:.4f}")

    ensure_models_dir()
    model_path = os.path.join(MODELS_DIR, "match_winner.pkl")
    with open(model_path, "wb") as f:
        pickle.dump(model, f)
    print(f"  Saved to {model_path}")

    return model


def train_player_score_model():
    """
    Train a model to predict player scores.
    Replace the synthetic data below with real IPL data from your database.
    """
    print("Training player score model...")

    # TODO: Replace with real data from database
    # Features: [player_avg, player_sr, opponent_bowling_avg, venue_avg_score, recent_form]
    np.random.seed(42)
    n_samples = 1000
    X = np.random.rand(n_samples, 5)
    y = (X[:, 0] * 40 + X[:, 1] * 30 + X[:, 3] * 20 + np.random.rand(n_samples) * 15).astype(int)

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    model = GradientBoostingRegressor(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)

    mae = mean_absolute_error(y_test, model.predict(X_test))
    print(f"  Player Score Model MAE: {mae:.4f}")

    ensure_models_dir()
    model_path = os.path.join(MODELS_DIR, "player_score.pkl")
    with open(model_path, "wb") as f:
        pickle.dump(model, f)
    print(f"  Saved to {model_path}")

    return model


if __name__ == "__main__":
    print("=" * 50)
    print("IPL Intelligence - Model Training")
    print("=" * 50)
    train_match_winner_model()
    print()
    train_player_score_model()
    print()
    print("All models trained and saved successfully!")
