import { Box, Typography, Button } from '@mui/material';
import { useRouter } from 'next/router';

export default function NotFoundPage() {
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
      <Typography variant="h2" fontWeight={900} color="primary.main">404</Typography>
      <Typography variant="h5" fontWeight={700}>Page Not Found</Typography>
      <Typography variant="body1" color="text.secondary">
        The page you are looking for does not exist.
      </Typography>
      <Button variant="contained" size="large" onClick={() => router.push('/dashboard')}>
        Go to Dashboard
      </Button>
    </Box>
  );
}
