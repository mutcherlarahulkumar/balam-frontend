import AppLayout from '@/components/layout/AppLayout';
import PrivateRoute from '@/components/layout/PrivateRoute';
import { Box, Typography } from '@mui/material';

export default function PaymentsPage() {
  return (
    <PrivateRoute>
      <AppLayout title="Payments">
        <Box textAlign="center" py={8}>
          <Typography variant="h5" color="text.secondary">Payments module coming soon</Typography>
          <Typography variant="body2" color="text.disabled" mt={1}>Will sync with LIC payment records in Phase 2.</Typography>
        </Box>
      </AppLayout>
    </PrivateRoute>
  );
}
