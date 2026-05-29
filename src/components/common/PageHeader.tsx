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
    <Box mb={2.5}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumbs sx={{ mb: 1 }}>
          {breadcrumbs.map((bc, i) =>
            bc.href ? (
              <Link
                key={i}
                component={NextLink}
                href={bc.href}
                underline="hover"
                color="text.secondary"
                sx={{ fontSize: '0.9rem' }}
              >
                {bc.label}
              </Link>
            ) : (
              <Typography key={i} color="text.primary" sx={{ fontSize: '0.9rem', fontWeight: 600 }}>
                {bc.label}
              </Typography>
            ),
          )}
        </Breadcrumbs>
      )}
      <Box
        display="flex"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        flexDirection={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        gap={1.5}
      >
        <Box>
          <Typography variant="h5" fontWeight={800} color="primary.main" sx={{ lineHeight: 1.2 }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary" mt={0.5}>
              {subtitle}
            </Typography>
          )}
        </Box>
        {action && (
          <Button
            variant="contained"
            startIcon={action.icon ?? <AddIcon />}
            onClick={action.onClick}
            size="large"
            sx={{ alignSelf: { xs: 'stretch', sm: 'auto' } }}
          >
            {action.label}
          </Button>
        )}
      </Box>
    </Box>
  );
}
