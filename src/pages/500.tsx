import { Box, Typography, Button } from '@mui/material';
import { useRouter } from 'next/router';

export default function ServerErrorPage() {
  const router = useRouter();
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      gap={2}
      sx={{ bgcolor: 'background.default', p: 3, textAlign: 'center' }}
    >
      <Typography variant="h2" fontWeight={900} color="error.main">500</Typography>
      <Typography variant="h5" fontWeight={700}>Server Error</Typography>
      <Typography variant="body1" color="text.secondary">
        Something went wrong on our end. Please try again.
      </Typography>
      <Button variant="contained" size="large" onClick={() => router.push('/dashboard')}>
        Go to Dashboard
      </Button>
    </Box>
  );
}
