import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';

interface Props {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  color?: string;
}

export default function StatCard({ title, value, subtitle, icon, color = 'primary.main' }: Props) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" alignItems="flex-start" justifyContent="space-between" gap={1}>
          <Box minWidth={0}>
            <Typography variant="body2" color="text.secondary" gutterBottom noWrap>{title}</Typography>
            <Typography
              variant="h5"
              fontWeight={800}
              color={color}
              sx={{ lineHeight: 1.2, wordBreak: 'break-all' }}
            >
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
                {subtitle}
              </Typography>
            )}
          </Box>
          {icon && <Box sx={{ color, opacity: 0.75, flexShrink: 0 }}>{icon}</Box>}
        </Box>
      </CardContent>
    </Card>
  );
}
