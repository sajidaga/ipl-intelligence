from pydantic import BaseModel, Field
from typing import Optional


class MatchPredictionRequest(BaseModel):
    home_team_id: str = Field(..., description="ID of the home team")
    away_team_id: str = Field(..., description="ID of the away team")
    venue: str = Field(..., description="Match venue")
    season: Optional[int] = Field(None, description="IPL season year")


class MatchPredictionResponse(BaseModel):
    home_team_id: str
    away_team_id: str
    predicted_winner_id: str
    win_probability: float = Field(..., ge=0, le=1, description="Probability between 0 and 1")
    confidence: str = Field(..., description="Confidence level: low, medium, high")
    factors: list[str] = Field(default_factory=list, description="Key factors influencing prediction")


class PlayerScoreRequest(BaseModel):
    player_id: str = Field(..., description="ID of the player")
    opponent_team_id: str = Field(..., description="ID of the opposing team")
    venue: str = Field(..., description="Match venue")
    season: Optional[int] = Field(None, description="IPL season year")


class PlayerScoreResponse(BaseModel):
    player_id: str
    predicted_runs: int = Field(..., ge=0, description="Predicted runs to be scored")
    predicted_wickets: int = Field(default=0, ge=0, description="Predicted wickets (if bowler)")
    predicted_strike_rate: float = Field(..., ge=0, description="Predicted strike rate")
    confidence: str = Field(..., description="Confidence level: low, medium, high")
    factors: list[str] = Field(default_factory=list, description="Key factors influencing prediction")


class TopScorerRequest(BaseModel):
    match_id: Optional[str] = Field(None, description="ID of the specific match")
    team_id: Optional[str] = Field(None, description="ID of the team (if predicting for a single team)")

class TopScorerResponse(BaseModel):
    player_id: str = Field(..., description="ID of the predicted top scorer")
    predicted_runs: int = Field(..., description="Expected runs they will score")
    confidence: str = Field(..., description="Confidence level: low, medium, high")
