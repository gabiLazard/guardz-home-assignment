export interface Submission {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSubmissionDto {
  name: string;
  email: string;
  phone?: string;
  message: string;
}
