import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const getMatchPrediction = async (matchData) => {
  const response = await axios.post(`${API_BASE}/predictions/match`, matchData);
  return response.data;
};

export const getPlayerScorePrediction = async (playerData) => {
  const response = await axios.post(`${API_BASE}/predictions/player-score`, playerData);
  return response.data;
};
