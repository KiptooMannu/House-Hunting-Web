import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api'; // Standard backend port

export const complianceApi = {
  listLogs: async () => {
    const response = await axios.get(`${API_BASE_URL}/compliance/logs`);
    return response.data;
  },
  submitNilFiling: async (period: { periodStart?: string; periodEnd?: string }) => {
    const response = await axios.post(`${API_BASE_URL}/compliance/nil-filing`, period);
    return response.data;
  },
};
