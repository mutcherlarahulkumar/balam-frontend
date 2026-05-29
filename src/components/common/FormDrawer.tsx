import React from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: number;
}

export default function FormDrawer({ open, onClose, title, children, width = 480 }: Props) {
  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          px={3}
          py={2}
          sx={{ bgcolor: 'primary.main', color: 'white' }}
        >
          <Typography variant="h6" fontWeight={700}>{title}</Typography>
          <IconButton onClick={onClose} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider />
        <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 3 }}>
          {children}
        </Box>
      </Box>
    </Drawer>
  );
}
