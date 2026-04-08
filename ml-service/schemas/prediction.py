from pydantic import BaseModel, Field
from typing import Optional


class MatchPredictionRequest(BaseModel):
    home_team_id: int = Field(..., description="ID of the home team")
    away_team_id: int = Field(..., description="ID of the away team")
    venue: str = Field(..., description="Match venue")
    season: Optional[int] = Field(None, description="IPL season year")


class MatchPredictionResponse(BaseModel):
    home_team_id: int
    away_team_id: int
    predicted_winner_id: int
    win_probability: float = Field(..., ge=0, le=1, description="Probability between 0 and 1")
    confidence: str = Field(..., description="Confidence level: low, medium, high")
    factors: list[str] = Field(default_factory=list, description="Key factors influencing prediction")


class PlayerScoreRequest(BaseModel):
    player_id: int = Field(..., description="ID of the player")
    opponent_team_id: int = Field(..., description="ID of the opposing team")
    venue: str = Field(..., description="Match venue")
    season: Optional[int] = Field(None, description="IPL season year")


class PlayerScoreResponse(BaseModel):
    player_id: int
    predicted_runs: int = Field(..., ge=0, description="Predicted runs to be scored")
    predicted_wickets: int = Field(default=0, ge=0, description="Predicted wickets (if bowler)")
    predicted_strike_rate: float = Field(..., ge=0, description="Predicted strike rate")
    confidence: str = Field(..., description="Confidence level: low, medium, high")
    factors: list[str] = Field(default_factory=list, description="Key factors influencing prediction")
