import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { submissionsApi } from '../services/api';
import type {CreateSubmissionDto} from '../types/submission';

interface SubmissionFormProps {
  onSubmitSuccess: () => void;
}

export const SubmissionForm: React.FC<SubmissionFormProps> = ({ onSubmitSuccess }) => {
  const [formData, setFormData] = useState<CreateSubmissionDto>({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await submissionsApi.create(formData);
      setSuccess(true);
      setFormData({ name: '', email: '', phone: '', message: '' });
      onSubmitSuccess();

      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit form. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Submit Your Information
      </Typography>

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Form submitted successfully!
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <TextField
          fullWidth
          required
          label="Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          margin="normal"
          disabled={loading}
        />

        <TextField
          fullWidth
          required
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          margin="normal"
          disabled={loading}
        />

        <TextField
          fullWidth
          label="Phone (Optional)"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          margin="normal"
          disabled={loading}
        />

        <TextField
          fullWidth
          required
          label="Message"
          name="message"
          multiline
          rows={4}
          value={formData.message}
          onChange={handleChange}
          margin="normal"
          disabled={loading}
        />

        <Button
          type="submit"
          variant="contained"
          size="large"
          endIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
          disabled={loading}
          sx={{ mt: 2 }}
        >
          {loading ? 'Submitting...' : 'Submit'}
        </Button>
      </Box>
    </Paper>
  );
};
