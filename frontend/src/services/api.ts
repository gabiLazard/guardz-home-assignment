import axios from 'axios';
import type {Submission, CreateSubmissionDto} from '../types/submission';

const API_BASE_URL = '/api';

export const submissionsApi = {
  create: async (data: CreateSubmissionDto): Promise<Submission> => {
    const response = await axios.post(`${API_BASE_URL}/submissions`, data);
    return response.data;
  },

  getAll: async (): Promise<Submission[]> => {
    const response = await axios.get(`${API_BASE_URL}/submissions`);
    return response.data;
  },

  getOne: async (id: string): Promise<Submission> => {
    const response = await axios.get(`${API_BASE_URL}/submissions/${id}`);
    return response.data;
  },
};
