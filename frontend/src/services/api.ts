import axios from 'axios';
import type {
  Submission,
  CreateSubmissionDto,
  PaginatedResponse,
  QueryParams,
} from '../types/submission';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const submissionsApi = {
  create: async (data: CreateSubmissionDto): Promise<Submission> => {
    const response = await axios.post(`${API_BASE_URL}/submissions`, data);
    return response.data;
  },

  getAll: async (params?: QueryParams): Promise<PaginatedResponse<Submission>> => {
    const response = await axios.get(`${API_BASE_URL}/submissions`, { params });
    return response.data;
  },

  getOne: async (id: string): Promise<Submission> => {
    const response = await axios.get(`${API_BASE_URL}/submissions/${id}`);
    return response.data;
  },
};
