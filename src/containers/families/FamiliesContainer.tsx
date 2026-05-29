import React, { useState } from 'react';
import {
  Table, TableBody, TableCell, TableHead, TableRow, Paper,
  TableContainer, IconButton, Chip, Box, TextField, Button,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AddIcon from '@mui/icons-material/Add';
import { useRouter } from 'next/router';
import { useFamilies, useCreateFamily, useUpdateFamily } from '@/hooks/useFamilies';
import PageHeader from '@/components/common/PageHeader';
import LoadingState from '@/components/common/LoadingState';
import ErrorState from '@/components/common/ErrorState';
import EmptyState from '@/components/common/EmptyState';
import SearchBar from '@/components/common/SearchBar';
import FormDrawer from '@/components/common/FormDrawer';
import FamilyForm from '@/components/families/FamilyForm';
import { FamilyListItem } from '@/types/family.types';
import { FamilyFormData } from '@/validations/family.validation';

export default function FamiliesContainer() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [page] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<FamilyListItem | null>(null);

  const { data, isLoading, isError, refetch } = useFamilies({ search, page, limit: 20 });
  const createFamily = useCreateFamily();
  const updateFamily = useUpdateFamily(editing?.familyCode ?? '');

  function handleSubmit(formData: FamilyFormData) {
    if (editing) {
      updateFamily.mutate(formData, { onSuccess: () => { setDrawerOpen(false); setEditing(null); } });
    } else {
      createFamily.mutate(formData, { onSuccess: () => setDrawerOpen(false) });
    }
  }

  function openEdit(family: FamilyListItem) {
    setEditing(family);
    setDrawerOpen(true);
  }

  function openCreate() {
    setEditing(null);
    setDrawerOpen(true);
  }

  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState onRetry={refetch} />;

  return (
    <>
      <PageHeader
        title="Families"
        subtitle={`${data?.total ?? 0} families in your portfolio`}
        action={{ label: 'Add Family', onClick: openCreate }}
      />
      <Box mb={2}>
        <SearchBar value={search} onChange={setSearch} placeholder="Search by name, mobile..." />
      </Box>
      {!data?.data?.length ? (
        <EmptyState title="No families" message="Add your first family to get started." action={{ label: 'Add Family', onClick: openCreate }} />
      ) : (
        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Code</TableCell>
                <TableCell>Head Name</TableCell>
                <TableCell>Mobile</TableCell>
                <TableCell>Pincode</TableCell>
                <TableCell align="center">Members</TableCell>
                <TableCell align="center">Policies</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.data.map((family) => (
                <TableRow key={family.id} hover>
                  <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>{family.familyCode}</TableCell>
                  <TableCell sx={{ fontWeight: 500 }}>{family.headName}</TableCell>
                  <TableCell>{family.mobile || '—'}</TableCell>
                  <TableCell>{family.pincode || '—'}</TableCell>
                  <TableCell align="center"><Chip label={family.memberCount} size="small" /></TableCell>
                  <TableCell align="center"><Chip label={family.policyCount} size="small" color="primary" /></TableCell>
                  <TableCell align="center">
                    <IconButton size="small" onClick={() => router.push(`/families/${family.familyCode}`)}>
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => openEdit(family)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <FormDrawer open={drawerOpen} onClose={() => { setDrawerOpen(false); setEditing(null); }} title={editing ? 'Edit Family' : 'Add Family'}>
        <FamilyForm
          defaultValues={editing ?? undefined}
          onSubmit={handleSubmit}
          loading={createFamily.isPending || updateFamily.isPending}
          onCancel={() => { setDrawerOpen(false); setEditing(null); }}
        />
      </FormDrawer>
    </>
  );
}
