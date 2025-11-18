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

interface ValidationErrors {
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
}

const MAX_NAME_LENGTH = 100;
const MAX_PHONE_LENGTH = 20;
const MAX_MESSAGE_LENGTH = 1000;

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
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());

  const validateField = (name: string, value: string): string | undefined => {
    switch (name) {
      case 'name':
        if (!value.trim()) return 'Name is required';
        if (value.length > MAX_NAME_LENGTH) return `Name must be ${MAX_NAME_LENGTH} characters or less`;
        return undefined;

      case 'email': {
        if (!value.trim()) return 'Email is required';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return 'Please enter a valid email address';
        return undefined;
      }

      case 'phone':
        if (value && value.replace(/\D/g, '').length > MAX_PHONE_LENGTH) {
          return `Phone must be ${MAX_PHONE_LENGTH} digits or less`;
        }
        return undefined;

      case 'message':
        if (!value.trim()) return 'Message is required';
        if (value.length > MAX_MESSAGE_LENGTH) return `Message must be ${MAX_MESSAGE_LENGTH} characters or less`;
        return undefined;

      default:
        return undefined;
    }
  };

  const formatPhoneNumber = (value: string): string => {
    // Remove all non-numeric characters
    const numbers = value.replace(/\D/g, '');

    // Format as 05X-XXX-XXXX (Israeli mobile format)
    if (numbers.length === 0) {
      return '';
    } else if (numbers.length <= 3) {
      return numbers;
    } else if (numbers.length <= 6) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    } else {
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    // Format phone number as user types
    let processedValue = value;
    if (name === 'phone') {
      processedValue = formatPhoneNumber(value);
    }

    setFormData((prev) => ({ ...prev, [name]: processedValue }));

    // Validate if field has been touched
    if (touched.has(name)) {
      const error = validateField(name, processedValue);
      setValidationErrors((prev) => ({
        ...prev,
        [name]: error,
      }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    // Mark field as touched
    setTouched((prev) => new Set(prev).add(name));

    // Trim whitespace for text fields (except phone which is already formatted)
    if (name !== 'phone') {
      const trimmedValue = value.trim();
      if (trimmedValue !== value) {
        setFormData((prev) => ({ ...prev, [name]: trimmedValue }));
      }
    }

    // Validate field
    const error = validateField(name, name === 'phone' ? value : value.trim());
    setValidationErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const errors: ValidationErrors = {};
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key as keyof CreateSubmissionDto] || '');
      if (error) {
        errors[key as keyof ValidationErrors] = error;
      }
    });

    // Mark all fields as touched
    setTouched(new Set(['name', 'email', 'phone', 'message']));
    setValidationErrors(errors);

    // Stop if there are validation errors
    if (Object.keys(errors).length > 0) {
      setError('Please fix the validation errors before submitting.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Remove phone formatting before sending (keep only numbers)
      const submissionData = {
        ...formData,
        phone: formData.phone ? formData.phone.replace(/\D/g, '') : undefined,
      };

      await submissionsApi.create(submissionData);
      setSuccess(true);
      setFormData({ name: '', email: '', phone: '', message: '' });
      setValidationErrors({});
      setTouched(new Set());
      onSubmitSuccess();

      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to submit form. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = () => {
    return (
      formData.name.trim() &&
      formData.email.trim() &&
      formData.message.trim() &&
      Object.keys(validationErrors).every((key) => !validationErrors[key as keyof ValidationErrors])
    );
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
          onBlur={handleBlur}
          margin="normal"
          disabled={loading}
          error={touched.has('name') && !!validationErrors.name}
          helperText={touched.has('name') && validationErrors.name}
          inputProps={{ maxLength: MAX_NAME_LENGTH }}
        />

        <TextField
          fullWidth
          required
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          onBlur={handleBlur}
          margin="normal"
          disabled={loading}
          error={touched.has('email') && !!validationErrors.email}
          helperText={touched.has('email') && validationErrors.email}
          placeholder="example@email.com"
        />

        <TextField
          fullWidth
          label="Phone (Optional)"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          onBlur={handleBlur}
          margin="normal"
          disabled={loading}
          error={touched.has('phone') && !!validationErrors.phone}
          helperText={touched.has('phone') ? validationErrors.phone : 'Format: 05X-XXX-XXXX'}
          placeholder="05X-XXX-XXXX"
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
          onBlur={handleBlur}
          margin="normal"
          disabled={loading}
          error={touched.has('message') && !!validationErrors.message}
          helperText={
            touched.has('message') && validationErrors.message
              ? validationErrors.message
              : `${formData.message.length}/${MAX_MESSAGE_LENGTH} characters`
          }
          inputProps={{ maxLength: MAX_MESSAGE_LENGTH }}
        />

        <Button
          type="submit"
          variant="contained"
          size="large"
          endIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
          disabled={loading || !isFormValid()}
          sx={{ mt: 2 }}
        >
          {loading ? 'Submitting...' : 'Submit'}
        </Button>
      </Box>
    </Paper>
  );
};
