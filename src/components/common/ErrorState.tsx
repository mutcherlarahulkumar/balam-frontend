import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

interface Props {
  message?: string;
  onRetry?: () => void;
}

export default function ErrorState({ message = 'Something went wrong', onRetry }: Props) {
  return (
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={8} gap={2}>
      <ErrorOutlineIcon color="error" sx={{ fontSize: 48 }} />
      <Typography variant="body1" color="text.secondary">{message}</Typography>
      {onRetry && <Button variant="outlined" onClick={onRetry}>Retry</Button>}
    </Box>
  );
}
