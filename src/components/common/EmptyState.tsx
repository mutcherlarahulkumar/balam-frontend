import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import InboxIcon from '@mui/icons-material/Inbox';

interface Props {
  title?: string;
  message?: string;
  action?: { label: string; onClick: () => void };
}

export default function EmptyState({
  title = 'No data found',
  message = 'There are no records to display.',
  action,
}: Props) {
  return (
    <Box display="flex" flexDirection="column" alignItems="center" py={8} gap={2}>
      <InboxIcon sx={{ fontSize: 56, color: 'text.disabled' }} />
      <Typography variant="h6" color="text.secondary">{title}</Typography>
      <Typography variant="body2" color="text.disabled">{message}</Typography>
      {action && <Button variant="contained" onClick={action.onClick}>{action.label}</Button>}
    </Box>
  );
}
