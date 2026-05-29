import React, { useState } from 'react';
import {
  Table, TableBody, TableCell, TableHead, TableRow, Paper, TableContainer, Chip,
  Box, Typography, Card, CardContent, Grid, Divider, useMediaQuery, useTheme,
} from '@mui/material';
import { useActivities, useCreateActivity } from '@/hooks/useActivities';
import PageHeader from '@/components/common/PageHeader';
import LoadingState from '@/components/common/LoadingState';
import ErrorState from '@/components/common/ErrorState';
import EmptyState from '@/components/common/EmptyState';
import FormDrawer from '@/components/common/FormDrawer';
import ActivityForm from '@/components/activities/ActivityForm';
import { formatDate } from '@/utils/date';
import { ActivityFormData } from '@/validations/activity.validation';
import { useToast } from '@/hooks/useToast';
import { ActivityStatus } from '@/types/common.types';

const STATUS_COLOR: Record<ActivityStatus, 'default' | 'warning' | 'success' | 'error'> = {
  PENDING: 'warning',
  DONE: 'success',
  CANCELLED: 'default',
};

export default function ActivitiesContainer() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const toast = useToast();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { data, isLoading, isError, refetch } = useActivities();
  const createActivity = useCreateActivity();

  function handleSubmit(formData: ActivityFormData) {
    createActivity.mutate(formData, {
      onSuccess: () => { toast.success('Activity logged'); setDrawerOpen(false); },
      onError: (err: any) => toast.error(err?.response?.data?.message ?? 'Something went wrong. Please try again.'),
    });
  }

  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState onRetry={refetch} />;

  const activities = Array.isArray(data) ? data : [];

  return (
    <>
      <PageHeader
        title="Activities"
        subtitle="Log and track client interactions"
        action={{ label: 'Log Activity', onClick: () => setDrawerOpen(true) }}
      />
      {!activities.length ? (
        <EmptyState title="No activities" message="Log your first client activity." action={{ label: 'Log Activity', onClick: () => setDrawerOpen(true) }} />
      ) : isMobile ? (
        <Grid container spacing={1.5}>
          {activities.map((a) => (
            <Grid item xs={12} key={a.id}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                    <Chip label={a.activityType} size="small" variant="outlined" />
                    <Chip
                      label={a.status}
                      size="small"
                      color={STATUS_COLOR[a.status as ActivityStatus] ?? 'default'}
                    />
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Date</Typography>
                      <Typography variant="body2" fontWeight={600}>{formatDate(a.activityDate)}</Typography>
                    </Grid>
                    {a.reminderDate && (
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">Reminder</Typography>
                        <Typography variant="body2">{formatDate(a.reminderDate)}</Typography>
                      </Grid>
                    )}
                    <Grid item xs={12}>
                      <Typography variant="caption" color="text.secondary">Details</Typography>
                      <Typography variant="body2">{a.details || '—'}</Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Type</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Details</TableCell>
                <TableCell>Reminder</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {activities.map((a) => (
                <TableRow key={a.id} hover>
                  <TableCell><Chip label={a.activityType} size="small" variant="outlined" /></TableCell>
                  <TableCell>{formatDate(a.activityDate)}</TableCell>
                  <TableCell>{a.details || '—'}</TableCell>
                  <TableCell>{a.reminderDate ? formatDate(a.reminderDate) : '—'}</TableCell>
                  <TableCell>
                    <Chip label={a.status} size="small" color={STATUS_COLOR[a.status as ActivityStatus] ?? 'default'} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <FormDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Log Activity">
        <ActivityForm onSubmit={handleSubmit} loading={createActivity.isPending} onCancel={() => setDrawerOpen(false)} />
      </FormDrawer>
    </>
  );
}
