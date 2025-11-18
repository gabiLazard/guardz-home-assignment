import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SubmissionForm } from '../SubmissionForm';
import * as api from '../../services/api';

vi.mock('../../services/api');

describe('SubmissionForm', () => {
  const mockOnSubmitSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the form with all fields', () => {
    render(<SubmissionForm onSubmitSuccess={mockOnSubmitSuccess} />);

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
  });

  it('submit button is disabled when form is empty', () => {
    render(<SubmissionForm onSubmitSuccess={mockOnSubmitSuccess} />);
    const submitButton = screen.getByRole('button', { name: /submit/i });
    expect(submitButton).toBeDisabled();
  });

  it('allows user to type in input fields', () => {
    render(<SubmissionForm onSubmitSuccess={mockOnSubmitSuccess} />);

    const nameInput = screen.getByLabelText(/name/i) as HTMLInputElement;
    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
    const messageInput = screen.getByLabelText(/message/i) as HTMLInputElement;

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.change(messageInput, { target: { value: 'Test message' } });

    expect(nameInput.value).toBe('John Doe');
    expect(emailInput.value).toBe('john@example.com');
    expect(messageInput.value).toBe('Test message');
  });

  it('validates email format and shows error', async () => {
    render(<SubmissionForm onSubmitSuccess={mockOnSubmitSuccess} />);

    const emailInput = screen.getByLabelText(/email/i);
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.blur(emailInput);

    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
    });
  });

  it('formats phone number as user types (Israeli format)', () => {
    render(<SubmissionForm onSubmitSuccess={mockOnSubmitSuccess} />);

    const phoneInput = screen.getByLabelText(/phone/i) as HTMLInputElement;

    fireEvent.change(phoneInput, { target: { value: '0501234567' } });

    expect(phoneInput.value).toBe('050-123-4567');
  });

  it('shows character counter for message field', () => {
    render(<SubmissionForm onSubmitSuccess={mockOnSubmitSuccess} />);

    const messageInput = screen.getByLabelText(/message/i);
    fireEvent.change(messageInput, { target: { value: 'Test' } });

    expect(screen.getByText(/4\/1000 characters/i)).toBeInTheDocument();
  });

  it('submits form successfully with formatted phone', async () => {
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
        phone: '0501234567', // Phone sent as digits only
        message: 'Test message',
      });
    });

    await waitFor(() => {
      expect(mockOnSubmitSuccess).toHaveBeenCalled();
    });
  });

  it('does not submit form with validation errors', async () => {
    render(<SubmissionForm onSubmitSuccess={mockOnSubmitSuccess} />);

    // Fill only name field
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'John Doe' } });

    const submitButton = screen.getByRole('button', { name: /submit/i });
    expect(submitButton).toBeDisabled();

    fireEvent.click(submitButton);

    // Should not call API
    expect(api.submissionsApi.create).not.toHaveBeenCalled();
    expect(mockOnSubmitSuccess).not.toHaveBeenCalled();
  });
});
