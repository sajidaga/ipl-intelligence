import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const getAllMatches = async () => {
  const response = await axios.get(`${API_BASE}/matches`);
  return response.data;
};

export const getMatchById = async (id) => {
  const response = await axios.get(`${API_BASE}/matches/${id}`);
  return response.data;
};

export const getUpcomingMatches = async () => {
  const response = await axios.get(`${API_BASE}/matches/upcoming`);
  return response.data;
};
