import { useState } from 'react';
import { Container, Typography, Box, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { SubmissionForm } from './components/SubmissionForm';
import { SubmissionsTable } from './components/SubmissionsTable';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleSubmitSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          py: 4,
        }}
      >
        <Container maxWidth="lg">
          <Box textAlign="center" mb={4}>
            <Typography
              variant="h2"
              component="h1"
              gutterBottom
              sx={{ color: 'white', fontWeight: 'bold' }}
            >
              Guardz Submission System
            </Typography>
            <Typography variant="h6" sx={{ color: 'white', opacity: 0.9 }}>
              Submit your information and view all submissions in real-time
            </Typography>
          </Box>

          <SubmissionForm onSubmitSuccess={handleSubmitSuccess} />
          <SubmissionsTable refreshTrigger={refreshTrigger} />
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
