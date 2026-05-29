import React from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: number;
}

export default function FormDrawer({ open, onClose, title, children, width = 520 }: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Drawer
      anchor={isMobile ? 'bottom' : 'right'}
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: isMobile
          ? {
              width: '100%',
              maxHeight: '92vh',
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              overflow: 'hidden',
            }
          : {
              width,
            },
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: isMobile ? '92vh' : '100vh' }}>
        {/* Header */}
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          px={2.5}
          py={2}
          sx={{ bgcolor: 'primary.main', color: 'white', flexShrink: 0 }}
        >
          <Typography variant="h6" fontWeight={700} fontSize={{ xs: '1rem', sm: '1.125rem' }}>
            {title}
          </Typography>
          <IconButton onClick={onClose} sx={{ color: 'white', p: 1 }}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider />
        {/* Scrollable body */}
        <Box
          sx={{
            flexGrow: 1,
            overflowY: 'auto',
            p: { xs: 2, sm: 3 },
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {children}
        </Box>
      </Box>
    </Drawer>
  );
}
