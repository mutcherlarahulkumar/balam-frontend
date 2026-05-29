import React, { useState } from 'react';
import {
  Box, Card, CardActionArea, CardContent, Typography, Grid, Divider,
  Table, TableBody, TableCell, TableHead, TableRow, Paper, TableContainer,
  IconButton, Chip, Select, MenuItem, FormControl, InputLabel, useMediaQuery, useTheme,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useRouter } from 'next/router';
import { useClients, useCreateClient, useUpdateClient } from '@/hooks/useClients';
import PageHeader from '@/components/common/PageHeader';
import LoadingState from '@/components/common/LoadingState';
import ErrorState from '@/components/common/ErrorState';
import EmptyState from '@/components/common/EmptyState';
import SearchBar from '@/components/common/SearchBar';
import FormDrawer from '@/components/common/FormDrawer';
import ClientForm from '@/components/clients/ClientForm';
import { Client } from '@/types/client.types';
import { ClientFormData } from '@/validations/client.validation';
import { ClientType } from '@/types/common.types';
import { formatDate } from '@/utils/date';
import { useToast } from '@/hooks/useToast';

const TYPE_LABEL: Record<ClientType, string> = { C: 'Customer', P: 'Prospect', N: 'Nominee' };
const TYPE_COLOR: Record<ClientType, 'success' | 'warning' | 'default'> = { C: 'success', P: 'warning', N: 'default' };

export default function ClientsContainer() {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [search, setSearch] = useState('');
  const [clientType, setClientType] = useState<ClientType | ''>('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const toast = useToast();

  const { data, isLoading, isError, refetch } = useClients({ search, clientType: clientType || undefined, limit: 20 });
  const createClient = useCreateClient();
  const updateClient = useUpdateClient(editing?.id ?? 0);

  function handleSubmit(formData: ClientFormData) {
    const opts = {
      onSuccess: () => { toast.success('Client saved'); setDrawerOpen(false); setEditing(null); },
      onError: (err: any) => toast.error(err?.response?.data?.message ?? 'Something went wrong. Please try again.'),
    };
    if (editing) updateClient.mutate(formData, opts);
    else createClient.mutate(formData, opts);
  }

  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState onRetry={refetch} />;

  return (
    <>
      <PageHeader
        title="Clients"
        subtitle={`${data?.total ?? 0} clients`}
        action={{ label: 'Add Client', onClick: () => { setEditing(null); setDrawerOpen(true); } }}
      />

      <Box display="flex" gap={1.5} mb={2} flexWrap="wrap">
        <Box flex={1} minWidth={160}>
          <SearchBar value={search} onChange={setSearch} placeholder="Search name or mobile..." />
        </Box>
        <FormControl size="small" sx={{ minWidth: 130 }}>
          <InputLabel>Type</InputLabel>
          <Select value={clientType} label="Type" onChange={(e) => setClientType(e.target.value as ClientType | '')}>
            <MenuItem value="">All</MenuItem>
            <MenuItem value="C">Customer</MenuItem>
            <MenuItem value="P">Prospect</MenuItem>
            <MenuItem value="N">Nominee</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {!data?.data?.length ? (
        <EmptyState
          title="No clients"
          message="Add your first client."
          action={{ label: 'Add Client', onClick: () => setDrawerOpen(true) }}
        />
      ) : isMobile ? (
        <Grid container spacing={1.5}>
          {data.data.map((client) => (
            <Grid item xs={12} key={client.id}>
              <Card variant="outlined">
                <CardActionArea onClick={() => router.push(`/clients/${client.id}`)}>
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                      <Box flex={1} minWidth={0} pr={1}>
                        <Typography variant="subtitle1" fontWeight={700} noWrap>{client.name}</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                          {client.familyCode}/{client.persCode}
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <Chip
                          label={TYPE_LABEL[client.clientType] ?? client.clientType}
                          size="small"
                          color={TYPE_COLOR[client.clientType] ?? 'default'}
                        />
                        <IconButton
                          size="medium"
                          onClick={(e) => { e.stopPropagation(); setEditing(client); setDrawerOpen(true); }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                    <Divider sx={{ my: 1 }} />
                    <Grid container spacing={1}>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary" display="block">Mobile</Typography>
                        <Typography variant="body2" fontWeight={600}>{client.mobile || '—'}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary" display="block">Date of Birth</Typography>
                        <Typography variant="body2">{formatDate(client.dob)}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary" display="block">Sex</Typography>
                        <Typography variant="body2">
                          {client.sex === 'M' ? 'Male' : client.sex === 'F' ? 'Female' : client.sex || '—'}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary" display="block">Occupation</Typography>
                        <Typography variant="body2" noWrap>{client.occupation || '—'}</Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Family/Person</TableCell>
                <TableCell>Mobile</TableCell>
                <TableCell>Date of Birth</TableCell>
                <TableCell>Sex</TableCell>
                <TableCell>Type</TableCell>
                <TableCell align="center" width={80}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.data.map((client) => (
                <TableRow
                  key={client.id}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => router.push(`/clients/${client.id}`)}
                >
                  <TableCell sx={{ fontWeight: 600 }}>{client.name}</TableCell>
                  <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                    {client.familyCode}/{client.persCode}
                  </TableCell>
                  <TableCell>{client.mobile || '—'}</TableCell>
                  <TableCell>{formatDate(client.dob)}</TableCell>
                  <TableCell>{client.sex === 'M' ? 'Male' : client.sex === 'F' ? 'Female' : client.sex || '—'}</TableCell>
                  <TableCell>
                    <Chip label={TYPE_LABEL[client.clientType] ?? client.clientType} size="small" color={TYPE_COLOR[client.clientType] ?? 'default'} />
                  </TableCell>
                  <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                    <IconButton size="small" onClick={() => { setEditing(client); setDrawerOpen(true); }}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => router.push(`/clients/${client.id}`)}>
                      <ChevronRightIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <FormDrawer
        open={drawerOpen}
        onClose={() => { setDrawerOpen(false); setEditing(null); }}
        title={editing ? 'Edit Client' : 'Add Client'}
      >
        <ClientForm
          initialValues={editing ? { ...editing, dob: editing.dob ?? undefined } : undefined}
          onSubmit={handleSubmit}
          loading={createClient.isPending || updateClient.isPending}
          onCancel={() => { setDrawerOpen(false); setEditing(null); }}
        />
      </FormDrawer>
    </>
  );
}
