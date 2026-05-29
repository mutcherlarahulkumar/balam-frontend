import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

interface Props {
  message?: string;
}

export default function LoadingState({ message = 'Loading...' }: Props) {
  return (
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={8} gap={2}>
      <CircularProgress color="primary" />
      <Typography variant="body2" color="text.secondary">{message}</Typography>
    </Box>
  );
}
