import React, { useState } from 'react';
import { useRouter } from 'next/router';
import {
  Grid, Card, CardContent, Typography, Box, Chip, Table, TableBody,
  TableCell, TableHead, TableRow, TableContainer, Button,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useFamily, useUpdateFamily } from '@/hooks/useFamilies';
import { useClients, useCreateClient } from '@/hooks/useClients';
import { usePolicies } from '@/hooks/usePolicies';
import LoadingState from '@/components/common/LoadingState';
import ErrorState from '@/components/common/ErrorState';
import PageHeader from '@/components/common/PageHeader';
import FormDrawer from '@/components/common/FormDrawer';
import FamilyForm from '@/components/families/FamilyForm';
import ClientForm from '@/components/clients/ClientForm';
import { PolicyStatusChip } from '@/components/common/StatusChip';
import { formatCurrency } from '@/utils/currency';
import { formatDate } from '@/utils/date';
import { FamilyFormData } from '@/validations/family.validation';
import { ClientFormData } from '@/validations/client.validation';

interface Props {
  familyCode: string;
}

export default function FamilyDetailContainer({ familyCode }: Props) {
  const router = useRouter();
  const [editFamilyOpen, setEditFamilyOpen] = useState(false);
  const [addClientOpen, setAddClientOpen] = useState(false);

  const { data: family, isLoading, isError, refetch } = useFamily(familyCode);
  const { data: clients } = useClients({ familyCode });
  const { data: policies } = usePolicies({ familyCode });
  const updateFamily = useUpdateFamily(familyCode);
  const createClient = useCreateClient();

  if (isLoading) return <LoadingState />;
  if (isError || !family) return <ErrorState onRetry={refetch} />;

  function handleUpdateFamily(data: FamilyFormData) {
    updateFamily.mutate(data, { onSuccess: () => setEditFamilyOpen(false) });
  }

  function handleAddClient(data: ClientFormData) {
    createClient.mutate({ ...data, familyCode }, { onSuccess: () => setAddClientOpen(false) });
  }

  return (
    <>
      <PageHeader
        title={family.headName}
        subtitle={`Family Code: ${family.familyCode}`}
        breadcrumbs={[{ label: 'Families', href: '/families' }, { label: family.headName }]}
        action={{ label: 'Edit Family', onClick: () => setEditFamilyOpen(true) }}
      />

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>Family Details</Typography>
              {([
                ['Family Code', family.familyCode],
                ['Mobile', family.mobile || '—'],
                ['Email', family.email || '—'],
                ['Address', family.address || '—'],
                ['Pincode', family.pincode || '—'],
                ['Religion', family.religion || '—'],
                ['Designation', family.designation || '—'],
              ] as [string, string][]).map(([label, value]) => (
                <Box key={label} display="flex" justifyContent="space-between" py={0.75} borderBottom="1px solid" borderColor="divider">
                  <Typography variant="body2" color="text.secondary">{label}</Typography>
                  <Typography variant="body2" fontWeight={500}>{value}</Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight={600}>Members ({clients?.total ?? 0})</Typography>
                <Button size="small" startIcon={<AddIcon />} onClick={() => setAddClientOpen(true)}>Add Member</Button>
              </Box>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Code</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>Mobile</TableCell>
                      <TableCell>DOB</TableCell>
                      <TableCell>Type</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {clients?.data?.map((c) => (
                      <TableRow key={c.id} hover sx={{ cursor: 'pointer' }} onClick={() => router.push(`/clients/${c.id}`)}>
                        <TableCell sx={{ fontFamily: 'monospace' }}>{c.persCode}</TableCell>
                        <TableCell>{c.name}</TableCell>
                        <TableCell>{c.mobile || '—'}</TableCell>
                        <TableCell>{formatDate(c.dob)}</TableCell>
                        <TableCell><Chip label={c.clientType} size="small" /></TableCell>
                      </TableRow>
                    ))}
                    {!clients?.data?.length && (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          <Typography variant="body2" color="text.secondary" py={2}>No members yet.</Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>Policies ({policies?.total ?? 0})</Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Policy No.</TableCell>
                      <TableCell>Plan</TableCell>
                      <TableCell>Premium</TableCell>
                      <TableCell>Next Due</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {policies?.data?.map((p) => (
                      <TableRow key={p.id} hover sx={{ cursor: 'pointer' }} onClick={() => router.push(`/policies/${p.policyNo}`)}>
                        <TableCell sx={{ fontFamily: 'monospace' }}>{p.policyNo}</TableCell>
                        <TableCell>{p.planName}</TableCell>
                        <TableCell>{formatCurrency(p.premium)}</TableCell>
                        <TableCell>{formatDate(p.nextPremium)}</TableCell>
                        <TableCell><PolicyStatusChip status={p.status} /></TableCell>
                      </TableRow>
                    ))}
                    {!policies?.data?.length && (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          <Typography variant="body2" color="text.secondary" py={2}>No policies yet.</Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <FormDrawer open={editFamilyOpen} onClose={() => setEditFamilyOpen(false)} title="Edit Family">
        <FamilyForm defaultValues={family} onSubmit={handleUpdateFamily} loading={updateFamily.isPending} onCancel={() => setEditFamilyOpen(false)} />
      </FormDrawer>
      <FormDrawer open={addClientOpen} onClose={() => setAddClientOpen(false)} title="Add Member">
        <ClientForm defaultValues={{ familyCode }} onSubmit={handleAddClient} loading={createClient.isPending} onCancel={() => setAddClientOpen(false)} />
      </FormDrawer>
    </>
  );
}
