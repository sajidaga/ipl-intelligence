from fastapi import APIRouter, HTTPException
from schemas.prediction import (
    MatchPredictionRequest,
    MatchPredictionResponse,
    PlayerScoreRequest,
    PlayerScoreResponse,
    TopScorerRequest,
    TopScorerResponse,
)
from ml.predict import predict_match_winner, predict_player_score, predict_top_scorer
from cache import get_cached, set_cached

router = APIRouter()


@router.post("/winner", response_model=MatchPredictionResponse)
async def predict_match(request: MatchPredictionRequest):
    """Predict the winner of a match between two teams."""
    cache_key = f"match:{request.home_team_id}:{request.away_team_id}:{request.venue}"
    cached = await get_cached(cache_key)
    if cached:
        return cached

    try:
        prediction = predict_match_winner(request)
        await set_cached(cache_key, prediction.model_dump(), ttl=300)
        return prediction
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/score", response_model=PlayerScoreResponse)
async def predict_player(request: PlayerScoreRequest):
    """Predict the score/performance for a player in a given match context."""
    cache_key = f"player:{request.player_id}:{request.opponent_team_id}:{request.venue}"
    cached = await get_cached(cache_key)
    if cached:
        return cached

    try:
        prediction = predict_player_score(request)
        await set_cached(cache_key, prediction.model_dump(), ttl=300)
        return prediction
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/topscorer", response_model=TopScorerResponse)
async def predict_top_batsman(request: TopScorerRequest):
    """Predict the highest scoring batsman for a given match or team."""
    cache_key = f"topscorer:match_{request.match_id}:team_{request.team_id}"
    cached = await get_cached(cache_key)
    if cached:
        return cached

    try:
        prediction = predict_top_scorer(request)
        await set_cached(cache_key, prediction.model_dump(), ttl=300)
        return prediction
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
