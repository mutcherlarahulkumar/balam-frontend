import React, { useState } from 'react';
import {
  Table, TableBody, TableCell, TableHead, TableRow, Paper, TableContainer, Chip,
  Box, Typography, Card, CardContent, Grid, Divider, useMediaQuery, useTheme,
} from '@mui/material';
import { useLeads, useCreateLead } from '@/hooks/useLeads';
import PageHeader from '@/components/common/PageHeader';
import LoadingState from '@/components/common/LoadingState';
import ErrorState from '@/components/common/ErrorState';
import EmptyState from '@/components/common/EmptyState';
import FormDrawer from '@/components/common/FormDrawer';
import LeadForm from '@/components/leads/LeadForm';
import { formatDate } from '@/utils/date';
import { LeadFormData } from '@/validations/lead.validation';

const STATUS_LABEL: Record<number, string> = { 0: 'New', 1: 'Contacted', 2: 'Interested', 3: 'Converted', 4: 'Lost' };
const STATUS_COLOR: Record<number, 'default' | 'info' | 'warning' | 'success' | 'error'> = {
  0: 'default', 1: 'info', 2: 'warning', 3: 'success', 4: 'error',
};

export default function LeadsContainer() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { data, isLoading, isError, refetch } = useLeads();
  const createLead = useCreateLead();

  function handleSubmit(formData: LeadFormData) {
    createLead.mutate(formData, { onSuccess: () => setDrawerOpen(false) });
  }

  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState onRetry={refetch} />;

  const leads = Array.isArray(data) ? data : [];

  return (
    <>
      <PageHeader
        title="Leads"
        subtitle="Track prospective clients and conversions"
        action={{ label: 'Add Lead', onClick: () => setDrawerOpen(true) }}
      />
      {!leads.length ? (
        <EmptyState title="No leads" message="Start adding prospect leads." action={{ label: 'Add Lead', onClick: () => setDrawerOpen(true) }} />
      ) : isMobile ? (
        <Grid container spacing={1.5}>
          {leads.map((lead) => (
            <Grid item xs={12} key={lead.id}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                    <Box flex={1} minWidth={0}>
                      <Typography variant="subtitle1" fontWeight={700} noWrap>{lead.name}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                        {lead.leadId || `#${lead.id}`}
                      </Typography>
                    </Box>
                    <Chip
                      label={STATUS_LABEL[lead.status] ?? 'Unknown'}
                      size="small"
                      color={STATUS_COLOR[lead.status] ?? 'default'}
                    />
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Mobile</Typography>
                      <Typography variant="body2" fontWeight={600}>{lead.mobile || '—'}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Date Added</Typography>
                      <Typography variant="body2">{formatDate(lead.dateAdded)}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="caption" color="text.secondary">Address</Typography>
                      <Typography variant="body2">{lead.address || '—'}</Typography>
                    </Grid>
                    {lead.searchTerm && (
                      <Grid item xs={12}>
                        <Typography variant="caption" color="text.secondary">Search Term</Typography>
                        <Typography variant="body2">{lead.searchTerm}</Typography>
                      </Grid>
                    )}
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
                <TableCell>Lead ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Mobile</TableCell>
                <TableCell>Address</TableCell>
                <TableCell>Search Term</TableCell>
                <TableCell>Date Added</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {leads.map((lead) => (
                <TableRow key={lead.id} hover>
                  <TableCell sx={{ fontFamily: 'monospace' }}>{lead.leadId || `#${lead.id}`}</TableCell>
                  <TableCell sx={{ fontWeight: 500 }}>{lead.name}</TableCell>
                  <TableCell>{lead.mobile}</TableCell>
                  <TableCell>{lead.address || '—'}</TableCell>
                  <TableCell>{lead.searchTerm || '—'}</TableCell>
                  <TableCell>{formatDate(lead.dateAdded)}</TableCell>
                  <TableCell>
                    <Chip label={STATUS_LABEL[lead.status] ?? 'Unknown'} size="small" color={STATUS_COLOR[lead.status] ?? 'default'} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <FormDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Add Lead">
        <LeadForm onSubmit={handleSubmit} loading={createLead.isPending} onCancel={() => setDrawerOpen(false)} />
      </FormDrawer>
    </>
  );
}
