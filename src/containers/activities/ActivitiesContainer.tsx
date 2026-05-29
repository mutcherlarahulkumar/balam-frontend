import React, { useState } from 'react';
import {
  Table, TableBody, TableCell, TableHead, TableRow, Paper, TableContainer, Chip,
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
import { ActivityStatus } from '@/types/common.types';

const STATUS_COLOR: Record<ActivityStatus, 'default' | 'warning' | 'success' | 'error'> = {
  PENDING: 'warning',
  DONE: 'success',
  CANCELLED: 'default',
};

export default function ActivitiesContainer() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { data, isLoading, isError, refetch } = useActivities();
  const createActivity = useCreateActivity();

  function handleSubmit(formData: ActivityFormData) {
    createActivity.mutate(formData, { onSuccess: () => setDrawerOpen(false) });
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
