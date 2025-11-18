import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SubmissionForm } from '../SubmissionForm';
import * as api from '../../services/api';

vi.mock('../../services/api');

describe('SubmissionForm', () => {
  const mockOnSubmitSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render all form fields', () => {
      render(<SubmissionForm onSubmitSuccess={mockOnSubmitSuccess} />);

      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
    });

    it('should render submit button', () => {
      render(<SubmissionForm onSubmitSuccess={mockOnSubmitSuccess} />);

      expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
    });

    it('should render form title', () => {
      render(<SubmissionForm onSubmitSuccess={mockOnSubmitSuccess} />);

      expect(screen.getByText(/submit your information/i)).toBeInTheDocument();
    });

    it('should show helper text for phone field', () => {
      render(<SubmissionForm onSubmitSuccess={mockOnSubmitSuccess} />);

      expect(screen.getByText(/format: 05x-xxx-xxxx/i)).toBeInTheDocument();
    });

    it('should show character counter for message field', () => {
      render(<SubmissionForm onSubmitSuccess={mockOnSubmitSuccess} />);

      expect(screen.getByText(/0\/1000 characters/i)).toBeInTheDocument();
    });
  });

  describe('Form State', () => {
    it('should have disabled submit button when form is empty', () => {
      render(<SubmissionForm onSubmitSuccess={mockOnSubmitSuccess} />);

      const submitButton = screen.getByRole('button', { name: /submit/i });
      expect(submitButton).toBeDisabled();
    });

    it('should enable submit button when all required fields are filled', async () => {
      render(<SubmissionForm onSubmitSuccess={mockOnSubmitSuccess} />);

      fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'John Doe' } });
      fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'john@example.com' } });
      fireEvent.change(screen.getByLabelText(/message/i), { target: { value: 'Test message' } });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /submit/i })).not.toBeDisabled();
      });
    });

    it('should allow typing in all input fields', () => {
      render(<SubmissionForm onSubmitSuccess={mockOnSubmitSuccess} />);

      const nameInput = screen.getByLabelText(/name/i) as HTMLInputElement;
      const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
      const phoneInput = screen.getByLabelText(/phone/i) as HTMLInputElement;
      const messageInput = screen.getByLabelText(/message/i) as HTMLTextAreaElement;

      fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
      fireEvent.change(phoneInput, { target: { value: '0501234567' } });
      fireEvent.change(messageInput, { target: { value: 'Test message' } });

      expect(nameInput.value).toBe('John Doe');
      expect(emailInput.value).toBe('john@example.com');
      expect(phoneInput.value).toBe('050-123-4567');
      expect(messageInput.value).toBe('Test message');
    });
  });

  describe('Validation', () => {
    it('should show error for empty name field', async () => {
      render(<SubmissionForm onSubmitSuccess={mockOnSubmitSuccess} />);

      const nameInput = screen.getByLabelText(/name/i);
      fireEvent.blur(nameInput);

      await waitFor(() => {
        expect(screen.getByText(/name is required/i)).toBeInTheDocument();
      });
    });

    it('should show error for empty email field', async () => {
      render(<SubmissionForm onSubmitSuccess={mockOnSubmitSuccess} />);

      const emailInput = screen.getByLabelText(/email/i);
      fireEvent.blur(emailInput);

      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      });
    });

    it('should show error for invalid email format', async () => {
      render(<SubmissionForm onSubmitSuccess={mockOnSubmitSuccess} />);

      const emailInput = screen.getByLabelText(/email/i);
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      fireEvent.blur(emailInput);

      await waitFor(() => {
        expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
      });
    });

    it('should show error for empty message field', async () => {
      render(<SubmissionForm onSubmitSuccess={mockOnSubmitSuccess} />);

      const messageInput = screen.getByLabelText(/message/i);
      fireEvent.blur(messageInput);

      await waitFor(() => {
        expect(screen.getByText(/message is required/i)).toBeInTheDocument();
      });
    });

    it('should show error when name exceeds max length', async () => {
      render(<SubmissionForm onSubmitSuccess={mockOnSubmitSuccess} />);

      const nameInput = screen.getByLabelText(/name/i);
      const longName = 'a'.repeat(101);
      fireEvent.change(nameInput, { target: { value: longName } });
      fireEvent.blur(nameInput);

      await waitFor(() => {
        expect(screen.getByText(/name must be 100 characters or less/i)).toBeInTheDocument();
      });
    });

    it('should show error when message exceeds max length', async () => {
      render(<SubmissionForm onSubmitSuccess={mockOnSubmitSuccess} />);

      const messageInput = screen.getByLabelText(/message/i);
      const longMessage = 'a'.repeat(1001);
      fireEvent.change(messageInput, { target: { value: longMessage } });
      fireEvent.blur(messageInput);

      await waitFor(() => {
        expect(screen.getByText(/message must be 1000 characters or less/i)).toBeInTheDocument();
      });
    });

    it('should limit phone to 10 digits during formatting', () => {
      render(<SubmissionForm onSubmitSuccess={mockOnSubmitSuccess} />);

      const phoneInput = screen.getByLabelText(/phone/i) as HTMLInputElement;
      const longPhone = '1'.repeat(21);
      fireEvent.change(phoneInput, { target: { value: longPhone } });

      // Phone should be limited to 10 digits (050-123-4567 format)
      expect(phoneInput.value.replace(/\D/g, '').length).toBeLessThanOrEqual(10);
    });

    it('should validate on blur', async () => {
      render(<SubmissionForm onSubmitSuccess={mockOnSubmitSuccess} />);

      const emailInput = screen.getByLabelText(/email/i);
      fireEvent.change(emailInput, { target: { value: 'test' } });
      fireEvent.blur(emailInput);

      await waitFor(() => {
        expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
      });
    });

    it('should validate as user types after field is touched', async () => {
      render(<SubmissionForm onSubmitSuccess={mockOnSubmitSuccess} />);

      const emailInput = screen.getByLabelText(/email/i);

      // Touch the field first
      fireEvent.change(emailInput, { target: { value: 'test' } });
      fireEvent.blur(emailInput);

      await waitFor(() => {
        expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
      });

      // Now fix it by typing
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

      await waitFor(() => {
        expect(screen.queryByText(/please enter a valid email address/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Phone Formatting', () => {
    it('should format phone number as user types', () => {
      render(<SubmissionForm onSubmitSuccess={mockOnSubmitSuccess} />);

      const phoneInput = screen.getByLabelText(/phone/i) as HTMLInputElement;

      fireEvent.change(phoneInput, { target: { value: '0501234567' } });

      expect(phoneInput.value).toBe('050-123-4567');
    });

    it('should format partial phone numbers correctly', () => {
      render(<SubmissionForm onSubmitSuccess={mockOnSubmitSuccess} />);

      const phoneInput = screen.getByLabelText(/phone/i) as HTMLInputElement;

      fireEvent.change(phoneInput, { target: { value: '050' } });
      expect(phoneInput.value).toBe('050');

      fireEvent.change(phoneInput, { target: { value: '0501' } });
      expect(phoneInput.value).toBe('050-1');

      fireEvent.change(phoneInput, { target: { value: '050123' } });
      expect(phoneInput.value).toBe('050-123');

      fireEvent.change(phoneInput, { target: { value: '0501234' } });
      expect(phoneInput.value).toBe('050-123-4');
    });

    it('should remove non-numeric characters when formatting', () => {
      render(<SubmissionForm onSubmitSuccess={mockOnSubmitSuccess} />);

      const phoneInput = screen.getByLabelText(/phone/i) as HTMLInputElement;

      fireEvent.change(phoneInput, { target: { value: '050-abc-1234' } });

      expect(phoneInput.value).toBe('050-123-4');
    });

    it('should limit phone to 10 digits', () => {
      render(<SubmissionForm onSubmitSuccess={mockOnSubmitSuccess} />);

      const phoneInput = screen.getByLabelText(/phone/i) as HTMLInputElement;

      fireEvent.change(phoneInput, { target: { value: '05012345678901234' } });

      expect(phoneInput.value).toBe('050-123-4567');
    });
  });

  describe('Character Counter', () => {
    it('should update character counter as user types', () => {
      render(<SubmissionForm onSubmitSuccess={mockOnSubmitSuccess} />);

      const messageInput = screen.getByLabelText(/message/i);

      fireEvent.change(messageInput, { target: { value: 'Test' } });

      expect(screen.getByText(/4\/1000 characters/i)).toBeInTheDocument();
    });

    it('should show correct count for longer messages', () => {
      render(<SubmissionForm onSubmitSuccess={mockOnSubmitSuccess} />);

      const messageInput = screen.getByLabelText(/message/i);
      const message = 'a'.repeat(100);

      fireEvent.change(messageInput, { target: { value: message } });

      expect(screen.getByText(/100\/1000 characters/i)).toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    it('should submit form successfully with all fields', async () => {
      const mockSubmission = {
        id: '123',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '0501234567',
        message: 'Test message',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      vi.spyOn(api.submissionsApi, 'create').mockResolvedValue(mockSubmission);

      render(<SubmissionForm onSubmitSuccess={mockOnSubmitSuccess} />);

      fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'John Doe' } });
      fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'john@example.com' } });
      fireEvent.change(screen.getByLabelText(/phone/i), { target: { value: '0501234567' } });
      fireEvent.change(screen.getByLabelText(/message/i), { target: { value: 'Test message' } });

      const submitButton = screen.getByRole('button', { name: /submit/i });

      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
      });

      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(api.submissionsApi.create).toHaveBeenCalledWith({
          name: 'John Doe',
          email: 'john@example.com',
          phone: '0501234567',
          message: 'Test message',
        });
      });

      await waitFor(() => {
        expect(mockOnSubmitSuccess).toHaveBeenCalled();
      });
    });

    it('should submit form without optional phone field', async () => {
      const mockSubmission = {
        id: '123',
        name: 'John Doe',
        email: 'john@example.com',
        message: 'Test message',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      vi.spyOn(api.submissionsApi, 'create').mockResolvedValue(mockSubmission);

      render(<SubmissionForm onSubmitSuccess={mockOnSubmitSuccess} />);

      fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'John Doe' } });
      fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'john@example.com' } });
      fireEvent.change(screen.getByLabelText(/message/i), { target: { value: 'Test message' } });

      const submitButton = screen.getByRole('button', { name: /submit/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(api.submissionsApi.create).toHaveBeenCalledWith({
          name: 'John Doe',
          email: 'john@example.com',
          phone: undefined,
          message: 'Test message',
        });
      });
    });

    it('should show success message after submission', async () => {
      const mockSubmission = {
        id: '123',
        name: 'John Doe',
        email: 'john@example.com',
        message: 'Test message',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      vi.spyOn(api.submissionsApi, 'create').mockResolvedValue(mockSubmission);

      render(<SubmissionForm onSubmitSuccess={mockOnSubmitSuccess} />);

      fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'John Doe' } });
      fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'john@example.com' } });
      fireEvent.change(screen.getByLabelText(/message/i), { target: { value: 'Test message' } });

      fireEvent.click(screen.getByRole('button', { name: /submit/i }));

      await waitFor(() => {
        expect(screen.getByText(/form submitted successfully/i)).toBeInTheDocument();
      });
    });

    it('should reset form after successful submission', async () => {
      const mockSubmission = {
        id: '123',
        name: 'John Doe',
        email: 'john@example.com',
        message: 'Test message',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      vi.spyOn(api.submissionsApi, 'create').mockResolvedValue(mockSubmission);

      render(<SubmissionForm onSubmitSuccess={mockOnSubmitSuccess} />);

      const nameInput = screen.getByLabelText(/name/i) as HTMLInputElement;
      const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
      const messageInput = screen.getByLabelText(/message/i) as HTMLTextAreaElement;

      fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
      fireEvent.change(messageInput, { target: { value: 'Test message' } });

      fireEvent.click(screen.getByRole('button', { name: /submit/i }));

      await waitFor(() => {
        expect(nameInput.value).toBe('');
        expect(emailInput.value).toBe('');
        expect(messageInput.value).toBe('');
      });
    });

    it('should show error message on submission failure', async () => {
      const error = {
        response: {
          data: {
            message: 'Submission failed',
          },
        },
      };

      vi.spyOn(api.submissionsApi, 'create').mockRejectedValue(error);

      render(<SubmissionForm onSubmitSuccess={mockOnSubmitSuccess} />);

      fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'John Doe' } });
      fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'john@example.com' } });
      fireEvent.change(screen.getByLabelText(/message/i), { target: { value: 'Test message' } });

      fireEvent.click(screen.getByRole('button', { name: /submit/i }));

      await waitFor(() => {
        expect(screen.getByText(/submission failed/i)).toBeInTheDocument();
      });
    });

    it('should show generic error when no error message provided', async () => {
      vi.spyOn(api.submissionsApi, 'create').mockRejectedValue(new Error());

      render(<SubmissionForm onSubmitSuccess={mockOnSubmitSuccess} />);

      fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'John Doe' } });
      fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'john@example.com' } });
      fireEvent.change(screen.getByLabelText(/message/i), { target: { value: 'Test message' } });

      fireEvent.click(screen.getByRole('button', { name: /submit/i }));

      await waitFor(() => {
        expect(screen.getByText(/failed to submit form/i)).toBeInTheDocument();
      });
    });

    it('should disable submit button during submission', async () => {
      vi.spyOn(api.submissionsApi, 'create').mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      render(<SubmissionForm onSubmitSuccess={mockOnSubmitSuccess} />);

      fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'John Doe' } });
      fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'john@example.com' } });
      fireEvent.change(screen.getByLabelText(/message/i), { target: { value: 'Test message' } });

      const submitButton = screen.getByRole('button', { name: /submit/i });
      fireEvent.click(submitButton);

      expect(submitButton).toBeDisabled();
      expect(screen.getByText(/submitting/i)).toBeInTheDocument();
    });

    it('should not submit form with validation errors', () => {
      render(<SubmissionForm onSubmitSuccess={mockOnSubmitSuccess} />);

      fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'John Doe' } });
      // Missing email and message

      const submitButton = screen.getByRole('button', { name: /submit/i });
      expect(submitButton).toBeDisabled();

      fireEvent.click(submitButton);

      expect(api.submissionsApi.create).not.toHaveBeenCalled();
    });

    it('should trim whitespace from text fields', async () => {
      const mockSubmission = {
        id: '123',
        name: 'John Doe',
        email: 'john@example.com',
        message: 'Test message',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      vi.spyOn(api.submissionsApi, 'create').mockResolvedValue(mockSubmission);

      render(<SubmissionForm onSubmitSuccess={mockOnSubmitSuccess} />);

      const nameInput = screen.getByLabelText(/name/i);
      fireEvent.change(nameInput, { target: { value: '  John Doe  ' } });
      fireEvent.blur(nameInput);

      const emailInput = screen.getByLabelText(/email/i);
      fireEvent.change(emailInput, { target: { value: '  john@example.com  ' } });
      fireEvent.blur(emailInput);

      const messageInput = screen.getByLabelText(/message/i);
      fireEvent.change(messageInput, { target: { value: '  Test message  ' } });
      fireEvent.blur(messageInput);

      fireEvent.click(screen.getByRole('button', { name: /submit/i }));

      await waitFor(() => {
        expect(api.submissionsApi.create).toHaveBeenCalledWith({
          name: 'John Doe',
          email: 'john@example.com',
          phone: undefined,
          message: 'Test message',
        });
      });
    });
  });

  describe('Loading States', () => {
    it('should disable all inputs during submission', async () => {
      vi.spyOn(api.submissionsApi, 'create').mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      render(<SubmissionForm onSubmitSuccess={mockOnSubmitSuccess} />);

      fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'John Doe' } });
      fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'john@example.com' } });
      fireEvent.change(screen.getByLabelText(/message/i), { target: { value: 'Test message' } });

      fireEvent.click(screen.getByRole('button', { name: /submit/i }));

      expect(screen.getByLabelText(/name/i)).toBeDisabled();
      expect(screen.getByLabelText(/email/i)).toBeDisabled();
      expect(screen.getByLabelText(/phone/i)).toBeDisabled();
      expect(screen.getByLabelText(/message/i)).toBeDisabled();
    });
  });
});
