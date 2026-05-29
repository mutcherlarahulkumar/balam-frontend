import React, { useState } from 'react';
import {
  Table, TableBody, TableCell, TableHead, TableRow, Paper, TableContainer,
  IconButton, Chip, Box, Card, CardContent, CardActionArea, Typography,
  Grid, Divider, useMediaQuery, useTheme,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import PeopleIcon from '@mui/icons-material/People';
import PolicyIcon from '@mui/icons-material/Policy';
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [search, setSearch] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<FamilyListItem | null>(null);

  const { data, isLoading, isError, refetch } = useFamilies({ search, limit: 20 });
  const createFamily = useCreateFamily();
  const updateFamily = useUpdateFamily(editing?.familyCode ?? '');

  function handleSubmit(formData: FamilyFormData) {
    if (editing) {
      updateFamily.mutate(formData, { onSuccess: () => { setDrawerOpen(false); setEditing(null); } });
    } else {
      createFamily.mutate(formData, { onSuccess: () => setDrawerOpen(false) });
    }
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
        <SearchBar value={search} onChange={setSearch} placeholder="Search by name or mobile..." />
      </Box>

      {!data?.data?.length ? (
        <EmptyState
          title="No families yet"
          message="Start by adding your first client family."
          action={{ label: 'Add Family', onClick: () => setDrawerOpen(true) }}
        />
      ) : isMobile ? (
        /* Mobile: card list */
        <Grid container spacing={1.5}>
          {data.data.map((family) => (
            <Grid item xs={12} key={family.id}>
              <Card>
                <CardActionArea onClick={() => router.push(`/families/${family.familyCode}`)}>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                      <Box flex={1} minWidth={0}>
                        <Typography variant="subtitle1" fontWeight={700} noWrap>{family.headName}</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                          {family.familyCode}
                        </Typography>
                        {family.mobile && (
                          <Typography variant="body2" color="text.secondary">📞 {family.mobile}</Typography>
                        )}
                      </Box>
                      <Box display="flex" alignItems="center" gap={0.5} ml={1}>
                        <IconButton
                          size="small"
                          onClick={(e) => { e.stopPropagation(); setEditing(family); setDrawerOpen(true); }}
                          sx={{ bgcolor: 'grey.100' }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <ChevronRightIcon color="action" />
                      </Box>
                    </Box>
                    <Divider sx={{ my: 1.5 }} />
                    <Box display="flex" gap={2}>
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <PeopleIcon fontSize="small" color="action" />
                        <Typography variant="body2">{family.memberCount} members</Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <PolicyIcon fontSize="small" color="primary" />
                        <Typography variant="body2" color="primary.main" fontWeight={600}>
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
        /* Desktop: table */
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
                <TableRow key={family.id} hover sx={{ cursor: 'pointer' }}>
                  <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>{family.familyCode}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} onClick={() => router.push(`/families/${family.familyCode}`)}>
                    {family.headName}
                  </TableCell>
                  <TableCell>{family.mobile || '—'}</TableCell>
                  <TableCell>{family.pincode || '—'}</TableCell>
                  <TableCell align="center"><Chip label={family.memberCount} size="small" /></TableCell>
                  <TableCell align="center"><Chip label={family.policyCount} size="small" color="primary" /></TableCell>
                  <TableCell align="center">
                    <IconButton size="small" onClick={() => router.push(`/families/${family.familyCode}`)}>
                      <ChevronRightIcon />
                    </IconButton>
                    <IconButton size="small" onClick={() => { setEditing(family); setDrawerOpen(true); }}>
                      <EditIcon fontSize="small" />
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
          defaultValues={editing ?? undefined}
          onSubmit={handleSubmit}
          loading={createFamily.isPending || updateFamily.isPending}
          onCancel={() => { setDrawerOpen(false); setEditing(null); }}
        />
      </FormDrawer>
    </>
  );
}
