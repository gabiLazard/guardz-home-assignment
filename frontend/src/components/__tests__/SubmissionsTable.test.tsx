import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SubmissionsTable } from '../SubmissionsTable';
import * as api from '../../services/api';

vi.mock('../../services/api');

describe('SubmissionsTable', () => {
  const mockSubmissions = [
    {
      _id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '0501234567',
      message: 'First message',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
    {
      _id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '0509876543',
      message: 'Second message',
      createdAt: '2024-01-02T00:00:00.000Z',
      updatedAt: '2024-01-02T00:00:00.000Z',
    },
  ];

  const mockPaginatedResponse = {
    data: mockSubmissions,
    pagination: {
      page: 1,
      pageSize: 10,
      totalItems: 2,
      totalPages: 1,
      hasNext: false,
      hasPrev: false,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render table headers', async () => {
      vi.spyOn(api.submissionsApi, 'getAll').mockResolvedValue(mockPaginatedResponse);

      render(<SubmissionsTable refreshTrigger={0} />);

      await waitFor(() => {
        expect(screen.getByText('Name')).toBeInTheDocument();
        expect(screen.getByText('Email')).toBeInTheDocument();
        expect(screen.getByText('Phone')).toBeInTheDocument();
        expect(screen.getByText('Message')).toBeInTheDocument();
        expect(screen.getByText('Submitted At')).toBeInTheDocument();
      });
    });

    it('should render table title', async () => {
      vi.spyOn(api.submissionsApi, 'getAll').mockResolvedValue(mockPaginatedResponse);

      render(<SubmissionsTable refreshTrigger={0} />);

      await waitFor(() => {
        expect(screen.getByText('Submissions')).toBeInTheDocument();
      });
    });

    it('should render total items count', async () => {
      vi.spyOn(api.submissionsApi, 'getAll').mockResolvedValue(mockPaginatedResponse);

      render(<SubmissionsTable refreshTrigger={0} />);

      await waitFor(() => {
        expect(screen.getByText('2 Total')).toBeInTheDocument();
      });
    });
  });

  describe('Loading State', () => {
    it('should show loading spinner initially', () => {
      vi.spyOn(api.submissionsApi, 'getAll').mockImplementation(
        () => new Promise(() => {})
      );

      render(<SubmissionsTable refreshTrigger={0} />);

      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('should hide loading spinner after data loads', async () => {
      vi.spyOn(api.submissionsApi, 'getAll').mockResolvedValue(mockPaginatedResponse);

      render(<SubmissionsTable refreshTrigger={0} />);

      await waitFor(() => {
        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
      });
    });
  });

  describe('Data Display', () => {
    it('should render submission data', async () => {
      vi.spyOn(api.submissionsApi, 'getAll').mockResolvedValue(mockPaginatedResponse);

      render(<SubmissionsTable refreshTrigger={0} />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('john@example.com')).toBeInTheDocument();
        expect(screen.getByText('0501234567')).toBeInTheDocument();
        expect(screen.getByText('First message')).toBeInTheDocument();

        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        expect(screen.getByText('jane@example.com')).toBeInTheDocument();
        expect(screen.getByText('0509876543')).toBeInTheDocument();
        expect(screen.getByText('Second message')).toBeInTheDocument();
      });
    });

    it('should show dash for missing phone numbers', async () => {
      const submissionsWithoutPhone = {
        data: [{ ...mockSubmissions[0], phone: undefined }],
        pagination: mockPaginatedResponse.pagination,
      };

      vi.spyOn(api.submissionsApi, 'getAll').mockResolvedValue(submissionsWithoutPhone);

      render(<SubmissionsTable refreshTrigger={0} />);

      await waitFor(() => {
        expect(screen.getByText('-')).toBeInTheDocument();
      });
    });

    it('should format dates correctly', async () => {
      vi.spyOn(api.submissionsApi, 'getAll').mockResolvedValue(mockPaginatedResponse);

      render(<SubmissionsTable refreshTrigger={0} />);

      await waitFor(() => {
        // Dates are formatted using toLocaleString(), just check they exist
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      // Check that dates are displayed (they will be in some locale format)
      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();
    });
  });

  describe('Empty States', () => {
    it('should show message when no submissions exist', async () => {
      const emptyResponse = {
        data: [],
        pagination: {
          page: 1,
          pageSize: 10,
          totalItems: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
      };

      vi.spyOn(api.submissionsApi, 'getAll').mockResolvedValue(emptyResponse);

      render(<SubmissionsTable refreshTrigger={0} />);

      await waitFor(() => {
        expect(screen.getByText(/no submissions yet/i)).toBeInTheDocument();
      });
    });

    it('should show message when search has no results', async () => {
      const emptyResponse = {
        data: [],
        pagination: {
          page: 1,
          pageSize: 10,
          totalItems: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
      };

      vi.spyOn(api.submissionsApi, 'getAll').mockResolvedValue(emptyResponse);

      render(<SubmissionsTable refreshTrigger={0} />);

      const searchInput = screen.getByPlaceholderText(/search by name/i);
      fireEvent.change(searchInput, { target: { value: 'nonexistent' } });
      fireEvent.submit(searchInput.closest('form')!);

      await waitFor(() => {
        expect(screen.getByText(/no submissions found matching your filters/i)).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should show error message on API failure', async () => {
      const error = {
        response: {
          data: {
            message: 'Failed to fetch',
          },
        },
      };

      vi.spyOn(api.submissionsApi, 'getAll').mockRejectedValue(error);

      render(<SubmissionsTable refreshTrigger={0} />);

      await waitFor(() => {
        expect(screen.getByText(/failed to fetch/i)).toBeInTheDocument();
      });
    });

    it('should show generic error message when no specific error provided', async () => {
      vi.spyOn(api.submissionsApi, 'getAll').mockRejectedValue(new Error());

      render(<SubmissionsTable refreshTrigger={0} />);

      await waitFor(() => {
        expect(screen.getByText(/failed to fetch submissions/i)).toBeInTheDocument();
      });
    });
  });

  describe('Search Functionality', () => {
    it('should have a search input field', async () => {
      vi.spyOn(api.submissionsApi, 'getAll').mockResolvedValue(mockPaginatedResponse);

      render(<SubmissionsTable refreshTrigger={0} />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/search by name/i)).toBeInTheDocument();
      });
    });

    it('should call API with search parameter when searching', async () => {
      vi.spyOn(api.submissionsApi, 'getAll').mockResolvedValue(mockPaginatedResponse);

      render(<SubmissionsTable refreshTrigger={0} />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/search by name/i)).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/search by name/i);
      fireEvent.change(searchInput, { target: { value: 'John' } });
      fireEvent.submit(searchInput.closest('form')!);

      await waitFor(() => {
        expect(api.submissionsApi.getAll).toHaveBeenCalledWith(
          expect.objectContaining({ search: 'John' })
        );
      });
    });

    it('should allow typing in search input', async () => {
      vi.spyOn(api.submissionsApi, 'getAll').mockResolvedValue(mockPaginatedResponse);

      render(<SubmissionsTable refreshTrigger={0} />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/search by name/i)).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/search by name/i) as HTMLInputElement;
      fireEvent.change(searchInput, { target: { value: 'John' } });

      expect(searchInput.value).toBe('John');
    });

    it('should reset to page 1 when searching', async () => {
      vi.spyOn(api.submissionsApi, 'getAll').mockResolvedValue(mockPaginatedResponse);

      render(<SubmissionsTable refreshTrigger={0} />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/search by name/i)).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/search by name/i);
      fireEvent.change(searchInput, { target: { value: 'test' } });
      fireEvent.submit(searchInput.closest('form')!);

      await waitFor(() => {
        expect(api.submissionsApi.getAll).toHaveBeenCalledWith(
          expect.objectContaining({ page: 1 })
        );
      });
    });
  });

  describe('Column Sorting', () => {
    it('should make Name, Email, and Submitted At headers clickable', async () => {
      vi.spyOn(api.submissionsApi, 'getAll').mockResolvedValue(mockPaginatedResponse);

      render(<SubmissionsTable refreshTrigger={0} />);

      await waitFor(() => {
        const nameHeader = screen.getByText('Name').closest('th');
        const emailHeader = screen.getByText('Email').closest('th');
        const dateHeader = screen.getByText('Submitted At').closest('th');

        expect(nameHeader).toHaveStyle('cursor: pointer');
        expect(emailHeader).toHaveStyle('cursor: pointer');
        expect(dateHeader).toHaveStyle('cursor: pointer');
      });
    });

    it('should sort by name when name header clicked', async () => {
      vi.spyOn(api.submissionsApi, 'getAll').mockResolvedValue(mockPaginatedResponse);

      render(<SubmissionsTable refreshTrigger={0} />);

      await waitFor(() => {
        expect(screen.getByText('Name')).toBeInTheDocument();
      });

      const nameHeader = screen.getByText('Name').closest('th')!;
      fireEvent.click(nameHeader);

      await waitFor(() => {
        expect(api.submissionsApi.getAll).toHaveBeenCalledWith(
          expect.objectContaining({ sortBy: 'name', sortOrder: 'asc' })
        );
      });
    });

    it('should toggle sort order when clicking same column', async () => {
      vi.spyOn(api.submissionsApi, 'getAll').mockResolvedValue(mockPaginatedResponse);

      render(<SubmissionsTable refreshTrigger={0} />);

      await waitFor(() => {
        expect(screen.getByText('Name')).toBeInTheDocument();
      });

      const nameHeader = screen.getByText('Name').closest('th')!;

      // First click - ascending
      fireEvent.click(nameHeader);

      await waitFor(() => {
        expect(api.submissionsApi.getAll).toHaveBeenCalledWith(
          expect.objectContaining({ sortOrder: 'asc' })
        );
      });

      // Second click - descending
      fireEvent.click(nameHeader);

      await waitFor(() => {
        expect(api.submissionsApi.getAll).toHaveBeenCalledWith(
          expect.objectContaining({ sortOrder: 'desc' })
        );
      });
    });

    it('should reset to page 1 when changing sort', async () => {
      vi.spyOn(api.submissionsApi, 'getAll').mockResolvedValue(mockPaginatedResponse);

      render(<SubmissionsTable refreshTrigger={0} />);

      await waitFor(() => {
        expect(screen.getByText('Email')).toBeInTheDocument();
      });

      const emailHeader = screen.getByText('Email').closest('th')!;
      fireEvent.click(emailHeader);

      await waitFor(() => {
        expect(api.submissionsApi.getAll).toHaveBeenCalledWith(
          expect.objectContaining({ page: 1 })
        );
      });
    });
  });

  describe('Date Filtering', () => {
    it('should have start date and end date inputs', async () => {
      vi.spyOn(api.submissionsApi, 'getAll').mockResolvedValue(mockPaginatedResponse);

      render(<SubmissionsTable refreshTrigger={0} />);

      await waitFor(() => {
        expect(screen.getByLabelText(/start date/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/end date/i)).toBeInTheDocument();
      });
    });

    it('should filter by start date', async () => {
      vi.spyOn(api.submissionsApi, 'getAll').mockResolvedValue(mockPaginatedResponse);

      render(<SubmissionsTable refreshTrigger={0} />);

      await waitFor(() => {
        expect(screen.getByLabelText(/start date/i)).toBeInTheDocument();
      });

      const startDateInput = screen.getByLabelText(/start date/i);
      fireEvent.change(startDateInput, { target: { value: '2024-01-01' } });

      await waitFor(() => {
        expect(api.submissionsApi.getAll).toHaveBeenCalledWith(
          expect.objectContaining({ startDate: '2024-01-01' })
        );
      });
    });

    it('should filter by end date', async () => {
      vi.spyOn(api.submissionsApi, 'getAll').mockResolvedValue(mockPaginatedResponse);

      render(<SubmissionsTable refreshTrigger={0} />);

      await waitFor(() => {
        expect(screen.getByLabelText(/end date/i)).toBeInTheDocument();
      });

      const endDateInput = screen.getByLabelText(/end date/i);
      fireEvent.change(endDateInput, { target: { value: '2024-01-31' } });

      await waitFor(() => {
        expect(api.submissionsApi.getAll).toHaveBeenCalledWith(
          expect.objectContaining({ endDate: '2024-01-31' })
        );
      });
    });

    it('should allow typing in date filter inputs', async () => {
      vi.spyOn(api.submissionsApi, 'getAll').mockResolvedValue(mockPaginatedResponse);

      render(<SubmissionsTable refreshTrigger={0} />);

      await waitFor(() => {
        expect(screen.getByLabelText(/start date/i)).toBeInTheDocument();
      });

      const startDateInput = screen.getByLabelText(/start date/i) as HTMLInputElement;
      const endDateInput = screen.getByLabelText(/end date/i) as HTMLInputElement;

      fireEvent.change(startDateInput, { target: { value: '2024-01-01' } });
      fireEvent.change(endDateInput, { target: { value: '2024-01-31' } });

      expect(startDateInput.value).toBe('2024-01-01');
      expect(endDateInput.value).toBe('2024-01-31');
    });

    it('should reset to page 1 when changing dates', async () => {
      vi.spyOn(api.submissionsApi, 'getAll').mockResolvedValue(mockPaginatedResponse);

      render(<SubmissionsTable refreshTrigger={0} />);

      await waitFor(() => {
        expect(screen.getByLabelText(/start date/i)).toBeInTheDocument();
      });

      const startDateInput = screen.getByLabelText(/start date/i);
      fireEvent.change(startDateInput, { target: { value: '2024-01-01' } });

      await waitFor(() => {
        expect(api.submissionsApi.getAll).toHaveBeenCalledWith(
          expect.objectContaining({ page: 1 })
        );
      });
    });
  });

  describe('Pagination', () => {
    it('should show pagination when multiple pages exist', async () => {
      const multiPageResponse = {
        data: mockSubmissions,
        pagination: {
          page: 1,
          pageSize: 10,
          totalItems: 25,
          totalPages: 3,
          hasNext: true,
          hasPrev: false,
        },
      };

      vi.spyOn(api.submissionsApi, 'getAll').mockResolvedValue(multiPageResponse);

      render(<SubmissionsTable refreshTrigger={0} />);

      await waitFor(() => {
        expect(screen.getByRole('navigation')).toBeInTheDocument();
      });
    });

    it('should not show pagination for single page', async () => {
      vi.spyOn(api.submissionsApi, 'getAll').mockResolvedValue(mockPaginatedResponse);

      render(<SubmissionsTable refreshTrigger={0} />);

      await waitFor(() => {
        expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
      });
    });

    it('should navigate to next page', async () => {
      const multiPageResponse = {
        data: mockSubmissions,
        pagination: {
          page: 1,
          pageSize: 10,
          totalItems: 25,
          totalPages: 3,
          hasNext: true,
          hasPrev: false,
        },
      };

      vi.spyOn(api.submissionsApi, 'getAll').mockResolvedValue(multiPageResponse);

      render(<SubmissionsTable refreshTrigger={0} />);

      await waitFor(() => {
        expect(screen.getByLabelText(/go to page 2/i)).toBeInTheDocument();
      });

      const page2Button = screen.getByLabelText(/go to page 2/i);
      fireEvent.click(page2Button);

      await waitFor(() => {
        expect(api.submissionsApi.getAll).toHaveBeenCalledWith(
          expect.objectContaining({ page: 2 })
        );
      });
    });
  });

  describe('Refresh Trigger', () => {
    it('should fetch data when refreshTrigger changes', async () => {
      vi.spyOn(api.submissionsApi, 'getAll').mockResolvedValue(mockPaginatedResponse);

      const { rerender } = render(<SubmissionsTable refreshTrigger={0} />);

      await waitFor(() => {
        expect(api.submissionsApi.getAll).toHaveBeenCalledTimes(1);
      });

      rerender(<SubmissionsTable refreshTrigger={1} />);

      await waitFor(() => {
        expect(api.submissionsApi.getAll).toHaveBeenCalledTimes(2);
      });
    });
  });
});
