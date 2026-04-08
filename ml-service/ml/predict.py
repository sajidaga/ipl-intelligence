"""
Prediction logic for match winner and player score models.
Loads pre-trained models from saved_models/ and runs inference.
"""

import os
import pickle
import numpy as np

from schemas.prediction import (
    MatchPredictionRequest,
    MatchPredictionResponse,
    PlayerScoreRequest,
    PlayerScoreResponse,
)

MODELS_DIR = os.path.join(os.path.dirname(__file__), "saved_models")

# Lazy-loaded model cache
_models = {}


def _load_model(model_name: str):
    """Load a model from disk, caching it in memory."""
    if model_name not in _models:
        model_path = os.path.join(MODELS_DIR, f"{model_name}.pkl")
        if not os.path.exists(model_path):
            raise FileNotFoundError(
                f"Model '{model_name}' not found at {model_path}. "
                "Run 'python -m ml.train' first to train the models."
            )
        with open(model_path, "rb") as f:
            _models[model_name] = pickle.load(f)
    return _models[model_name]


def _get_confidence(probability: float) -> str:
    """Convert a probability to a confidence label."""
    if probability >= 0.75:
        return "high"
    elif probability >= 0.55:
        return "medium"
    return "low"


def predict_match_winner(request: MatchPredictionRequest) -> MatchPredictionResponse:
    """Predict the winner of a match."""
    model = _load_model("match_winner")

    # TODO: Replace with real feature engineering from database
    # For now using placeholder features
    features = np.array([[0.6, 0.5, 0.5, 0.55, 0.5]])

    prediction = model.predict(features)[0]
    probabilities = model.predict_proba(features)[0]
    win_prob = float(max(probabilities))

    predicted_winner_id = request.home_team_id if prediction == 1 else request.away_team_id

    factors = []
    if probabilities[1] > 0.6:
        factors.append("Strong home advantage")
    if probabilities[0] > 0.6:
        factors.append("Away team in better form")
    factors.append(f"Venue: {request.venue}")

    return MatchPredictionResponse(
        home_team_id=request.home_team_id,
        away_team_id=request.away_team_id,
        predicted_winner_id=predicted_winner_id,
        win_probability=round(win_prob, 4),
        confidence=_get_confidence(win_prob),
        factors=factors,
    )


def predict_player_score(request: PlayerScoreRequest) -> PlayerScoreResponse:
    """Predict a player's score in a match."""
    model = _load_model("player_score")

    # TODO: Replace with real feature engineering from database
    features = np.array([[0.6, 0.55, 0.5, 0.5, 0.6]])

    predicted_runs = int(max(0, model.predict(features)[0]))

    factors = [f"Venue: {request.venue}", "Based on historical performance"]

    return PlayerScoreResponse(
        player_id=request.player_id,
        predicted_runs=predicted_runs,
        predicted_wickets=0,
        predicted_strike_rate=round(predicted_runs * 1.2 + 50, 2),
        confidence="medium",
        factors=factors,
    )
