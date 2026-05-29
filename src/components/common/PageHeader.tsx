import React from 'react';
import { Box, Typography, Button, Breadcrumbs, Link } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import NextLink from 'next/link';

interface Breadcrumb {
  label: string;
  href?: string;
}

interface Props {
  title: string;
  subtitle?: string;
  breadcrumbs?: Breadcrumb[];
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
}

export default function PageHeader({ title, subtitle, breadcrumbs, action }: Props) {
  return (
    <Box mb={3}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumbs sx={{ mb: 1 }}>
          {breadcrumbs.map((bc, i) =>
            bc.href ? (
              <Link key={i} component={NextLink} href={bc.href} underline="hover" color="inherit" sx={{ fontSize: 13 }}>
                {bc.label}
              </Link>
            ) : (
              <Typography key={i} color="text.primary" sx={{ fontSize: 13 }}>
                {bc.label}
              </Typography>
            ),
          )}
        </Breadcrumbs>
      )}
      <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h5" fontWeight={700} color="primary.main">{title}</Typography>
          {subtitle && <Typography variant="body2" color="text.secondary" mt={0.5}>{subtitle}</Typography>}
        </Box>
        {action && (
          <Button variant="contained" startIcon={action.icon ?? <AddIcon />} onClick={action.onClick}>
            {action.label}
          </Button>
        )}
      </Box>
    </Box>
  );
}
