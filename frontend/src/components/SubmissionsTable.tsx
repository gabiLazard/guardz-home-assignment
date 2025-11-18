import React, { useEffect, useState } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
  Alert,
  Box,
  Chip,
  TextField,
  InputAdornment,
  Pagination,
  Grid,
  IconButton,
  Tooltip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { submissionsApi } from '../services/api';
import type { Submission, PaginationInfo, QueryParams } from '../types/submission';

interface SubmissionsTableProps {
  refreshTrigger: number;
}

export const SubmissionsTable: React.FC<SubmissionsTableProps> = ({ refreshTrigger }) => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Query parameters state
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    fetchSubmissions();
  }, [refreshTrigger, page, search, startDate, endDate, sortBy, sortOrder]);

  const fetchSubmissions = async () => {
    setLoading(true);
    setError(null);

    try {
      const params: QueryParams = {
        page,
        sortBy,
        sortOrder,
        ...(search && { search }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
      };

      const response = await submissionsApi.getAll(params);
      setSubmissions(response.data);
      setPagination(response.pagination);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch submissions.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1); // Reset to page 1 when searching
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setSearch('');
    setPage(1);
  };

  const handleClearDates = () => {
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      // Toggle sort order if clicking the same column
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // New column, default to ascending
      setSortBy(column);
      setSortOrder('asc');
    }
    setPage(1); // Reset to first page when sorting changes
  };

  const getSortIcon = (column: string) => {
    if (sortBy !== column) return null;
    return sortOrder === 'asc' ? (
      <ArrowUpwardIcon fontSize="small" sx={{ ml: 0.5 }} />
    ) : (
      <ArrowDownwardIcon fontSize="small" sx={{ ml: 0.5 }} />
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Paper elevation={3}>
      <Box p={3}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5" component="h2">
            Submissions
          </Typography>
          {pagination && (
            <Chip label={`${pagination.totalItems} Total`} color="primary" />
          )}
        </Box>

        {/* Search and Filter Controls */}
        <Box mb={3}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box component="form" onSubmit={handleSearchSubmit}>
                <TextField
                  fullWidth
                  placeholder="Search by name, email, or message..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                    endAdornment: searchInput && (
                      <InputAdornment position="end">
                        <Tooltip title="Clear search">
                          <IconButton onClick={handleClearSearch} size="small">
                            <ClearIcon />
                          </IconButton>
                        </Tooltip>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                type="date"
                label="Start Date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setPage(1);
                }}
                InputLabelProps={{ shrink: true }}
                onClick={(e) => {
                  const input = (e.target as HTMLElement).querySelector('input');
                  if (input) {
                    input.showPicker?.();
                  }
                }}
                inputProps={{
                  ...(endDate && { max: endDate }),
                  onClick: (e: React.MouseEvent<HTMLInputElement>) => {
                    e.currentTarget.showPicker?.();
                  }
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Box display="flex" gap={1}>
                <TextField
                  fullWidth
                  type="date"
                  label="End Date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setPage(1);
                  }}
                  InputLabelProps={{ shrink: true }}
                  onClick={(e) => {
                    const input = (e.target as HTMLElement).querySelector('input');
                    if (input) {
                      input.showPicker?.();
                    }
                  }}
                  inputProps={{
                    ...(startDate && { min: startDate }),
                    onClick: (e: React.MouseEvent<HTMLInputElement>) => {
                      e.currentTarget.showPicker?.();
                    }
                  }}
                />
                {(startDate || endDate) && (
                  <Tooltip title="Clear dates">
                    <IconButton onClick={handleClearDates} color="primary">
                      <ClearIcon />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            </Grid>
          </Grid>
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : submissions.length === 0 ? (
          <Alert severity="info">
            {search || startDate || endDate
              ? 'No submissions found matching your filters.'
              : 'No submissions yet. Be the first to submit!'}
          </Alert>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell
                      sx={{
                        cursor: 'pointer',
                        userSelect: 'none',
                        '&:hover': { bgcolor: 'action.hover' },
                      }}
                      onClick={() => handleSort('name')}
                    >
                      <Box display="flex" alignItems="center">
                        <strong>Name</strong>
                        {getSortIcon('name')}
                      </Box>
                    </TableCell>
                    <TableCell
                      sx={{
                        cursor: 'pointer',
                        userSelect: 'none',
                        '&:hover': { bgcolor: 'action.hover' },
                      }}
                      onClick={() => handleSort('email')}
                    >
                      <Box display="flex" alignItems="center">
                        <strong>Email</strong>
                        {getSortIcon('email')}
                      </Box>
                    </TableCell>
                    <TableCell><strong>Phone</strong></TableCell>
                    <TableCell><strong>Message</strong></TableCell>
                    <TableCell
                      sx={{
                        cursor: 'pointer',
                        userSelect: 'none',
                        '&:hover': { bgcolor: 'action.hover' },
                      }}
                      onClick={() => handleSort('createdAt')}
                    >
                      <Box display="flex" alignItems="center">
                        <strong>Submitted At</strong>
                        {getSortIcon('createdAt')}
                      </Box>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {submissions.map((submission) => (
                    <TableRow key={submission._id} hover>
                      <TableCell>{submission.name}</TableCell>
                      <TableCell>{submission.email}</TableCell>
                      <TableCell>{submission.phone || '-'}</TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            maxWidth: 300,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {submission.message}
                        </Box>
                      </TableCell>
                      <TableCell>{formatDate(submission.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination Controls */}
            {pagination && pagination.totalPages > 1 && (
              <Box display="flex" justifyContent="center" mt={3}>
                <Pagination
                  count={pagination.totalPages}
                  page={pagination.page}
                  onChange={handlePageChange}
                  color="primary"
                  showFirstButton
                  showLastButton
                />
              </Box>
            )}
          </>
        )}
      </Box>
    </Paper>
  );
};
