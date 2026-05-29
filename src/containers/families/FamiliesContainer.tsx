import React, { useState } from 'react';
import {
  Box, Card, CardActionArea, CardContent, Typography, Grid,
  Table, TableBody, TableCell, TableHead, TableRow, Paper, TableContainer,
  IconButton, Chip, useMediaQuery, useTheme,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import PeopleIcon from '@mui/icons-material/People';
import PolicyIcon from '@mui/icons-material/Policy';
import PhoneIcon from '@mui/icons-material/Phone';
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
import { useToast } from '@/hooks/useToast';

export default function FamiliesContainer() {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [search, setSearch] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<FamilyListItem | null>(null);
  const toast = useToast();

  const { data, isLoading, isError, refetch } = useFamilies({ search, limit: 20 });
  const createFamily = useCreateFamily();
  const updateFamily = useUpdateFamily(editing?.familyCode ?? '');

  function handleSubmit(formData: FamilyFormData) {
    const opts = {
      onSuccess: () => { toast.success('Family saved'); setDrawerOpen(false); setEditing(null); },
      onError: (err: any) => toast.error(err?.response?.data?.message ?? 'Something went wrong. Please try again.'),
    };
    if (editing) updateFamily.mutate(formData, opts);
    else createFamily.mutate(formData, opts);
  }

  function openEdit(e: React.MouseEvent, family: FamilyListItem) {
    e.stopPropagation();
    setEditing(family);
    setDrawerOpen(true);
  }

  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState onRetry={refetch} />;

  return (
    <>
      <PageHeader
        title="Families"
        subtitle={`${data?.total ?? 0} families`}
        action={{ label: 'Add Family', onClick: () => { setEditing(null); setDrawerOpen(true); } }}
      />

      <Box mb={2}>
        <SearchBar value={search} onChange={setSearch} placeholder="Search name or mobile..." />
      </Box>

      {!data?.data?.length ? (
        <EmptyState
          title="No families yet"
          message="Start by adding your first client family."
          action={{ label: 'Add Family', onClick: () => setDrawerOpen(true) }}
        />
      ) : isMobile ? (
        <Grid container spacing={1.5}>
          {data.data.map((family) => (
            <Grid item xs={12} key={family.id}>
              <Card variant="outlined">
                <CardActionArea onClick={() => router.push(`/families/${family.familyCode}`)}>
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                      <Box flex={1} minWidth={0} pr={1}>
                        <Typography variant="subtitle1" fontWeight={700} noWrap>{family.headName}</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                          {family.familyCode}
                        </Typography>
                        {family.mobile && (
                          <Box display="flex" alignItems="center" gap={0.5} mt={0.5}>
                            <PhoneIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                            <Typography variant="caption" color="text.secondary">{family.mobile}</Typography>
                          </Box>
                        )}
                      </Box>
                      <IconButton
                        size="medium"
                        onClick={(e) => openEdit(e, family)}
                        sx={{ mt: -0.5 }}
                        aria-label="edit family"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Box>
                    <Box display="flex" gap={2} mt={1.5}>
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <PeopleIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="caption">{family.memberCount} members</Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <PolicyIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                        <Typography variant="caption" color="primary.main" fontWeight={600}>
                          {family.policyCount} policies
                        </Typography>
                      </Box>
                    </Box>
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
                <TableCell>Code</TableCell>
                <TableCell>Head Name</TableCell>
                <TableCell>Mobile</TableCell>
                <TableCell>Pincode</TableCell>
                <TableCell align="center">Members</TableCell>
                <TableCell align="center">Policies</TableCell>
                <TableCell align="center" width={80}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.data.map((family) => (
                <TableRow
                  key={family.id}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => router.push(`/families/${family.familyCode}`)}
                >
                  <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '0.8rem' }}>
                    {family.familyCode}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{family.headName}</TableCell>
                  <TableCell>{family.mobile || '—'}</TableCell>
                  <TableCell>{family.pincode || '—'}</TableCell>
                  <TableCell align="center"><Chip label={family.memberCount} size="small" /></TableCell>
                  <TableCell align="center"><Chip label={family.policyCount} size="small" color="primary" /></TableCell>
                  <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                    <IconButton size="small" onClick={(e) => openEdit(e, family)} aria-label="edit">
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => router.push(`/families/${family.familyCode}`)}>
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
        title={editing ? 'Edit Family' : 'Add Family'}
      >
        <FamilyForm
          initialValues={editing ?? undefined}
          onSubmit={handleSubmit}
          loading={createFamily.isPending || updateFamily.isPending}
          onCancel={() => { setDrawerOpen(false); setEditing(null); }}
        />
      </FormDrawer>
    </>
  );
}
