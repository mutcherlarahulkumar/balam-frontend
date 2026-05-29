import React, { useState } from 'react';
import {
  Table, TableBody, TableCell, TableHead, TableRow, Paper,
  TableContainer, IconButton, Chip, Box, Select, MenuItem, FormControl, InputLabel,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
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

export default function ClientsContainer() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [clientType, setClientType] = useState<ClientType | ''>('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);

  const { data, isLoading, isError, refetch } = useClients({
    search,
    clientType: clientType || undefined,
    limit: 20,
  });
  const createClient = useCreateClient();
  const updateClient = useUpdateClient(editing?.id ?? 0);

  function handleSubmit(formData: ClientFormData) {
    if (editing) {
      updateClient.mutate(formData, { onSuccess: () => { setDrawerOpen(false); setEditing(null); } });
    } else {
      createClient.mutate(formData, { onSuccess: () => setDrawerOpen(false) });
    }
  }

  const CLIENT_TYPE_LABELS: Record<ClientType, string> = { C: 'Customer', P: 'Prospect', N: 'New' };

  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState onRetry={refetch} />;

  return (
    <>
      <PageHeader
        title="Clients"
        subtitle={`${data?.total ?? 0} clients`}
        action={{ label: 'Add Client', onClick: () => { setEditing(null); setDrawerOpen(true); } }}
      />
      <Box display="flex" gap={2} mb={2} flexWrap="wrap">
        <SearchBar value={search} onChange={setSearch} placeholder="Search name, mobile..." />
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Client Type</InputLabel>
          <Select
            value={clientType}
            label="Client Type"
            onChange={(e) => setClientType(e.target.value as ClientType | '')}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="C">Customer</MenuItem>
            <MenuItem value="P">Prospect</MenuItem>
            <MenuItem value="N">New</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {!data?.data?.length ? (
        <EmptyState title="No clients" message="Add your first client." action={{ label: 'Add Client', onClick: () => setDrawerOpen(true) }} />
      ) : (
        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Family</TableCell>
                <TableCell>Mobile</TableCell>
                <TableCell>DOB</TableCell>
                <TableCell>Sex</TableCell>
                <TableCell>Type</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.data.map((client) => (
                <TableRow key={client.id} hover>
                  <TableCell sx={{ fontWeight: 500 }}>{client.name}</TableCell>
                  <TableCell sx={{ fontFamily: 'monospace' }}>{client.familyCode}/{client.persCode}</TableCell>
                  <TableCell>{client.mobile || '—'}</TableCell>
                  <TableCell>{formatDate(client.dob)}</TableCell>
                  <TableCell>{client.sex || '—'}</TableCell>
                  <TableCell>
                    <Chip
                      label={CLIENT_TYPE_LABELS[client.clientType] ?? client.clientType}
                      size="small"
                      color={client.clientType === 'C' ? 'success' : client.clientType === 'P' ? 'warning' : 'default'}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton size="small" onClick={() => router.push(`/clients/${client.id}`)}>
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => { setEditing(client); setDrawerOpen(true); }}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <FormDrawer open={drawerOpen} onClose={() => { setDrawerOpen(false); setEditing(null); }} title={editing ? 'Edit Client' : 'Add Client'}>
        <ClientForm
          defaultValues={editing ?? undefined}
          onSubmit={handleSubmit}
          loading={createClient.isPending || updateClient.isPending}
          onCancel={() => { setDrawerOpen(false); setEditing(null); }}
        />
      </FormDrawer>
    </>
  );
}
