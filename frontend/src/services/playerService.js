import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const getAllPlayers = async () => {
  const response = await axios.get(`${API_BASE}/players`);
  return response.data;
};

export const getPlayerById = async (id) => {
  const response = await axios.get(`${API_BASE}/players/${id}`);
  return response.data;
};

export const getPlayerStats = async (id) => {
  const response = await axios.get(`${API_BASE}/players/${id}/stats`);
  return response.data;
};
