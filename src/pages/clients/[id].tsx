import { useRouter } from 'next/router';
import AppLayout from '@/components/layout/AppLayout';
import PrivateRoute from '@/components/layout/PrivateRoute';
import { useClient } from '@/hooks/useClients';
import LoadingState from '@/components/common/LoadingState';
import ErrorState from '@/components/common/ErrorState';
import PageHeader from '@/components/common/PageHeader';
import {
  Card, CardContent, Typography, Box, Grid,
} from '@mui/material';
import { formatDate } from '@/utils/date';

function ClientDetailContent({ id }: { id: number }) {
  const { data: client, isLoading, isError, refetch } = useClient(id);

  if (isLoading) return <LoadingState />;
  if (isError || !client) return <ErrorState onRetry={refetch} />;

  return (
    <>
      <PageHeader
        title={client.name}
        subtitle={`${client.familyCode} / ${client.persCode}`}
        breadcrumbs={[{ label: 'Clients', href: '/clients' }, { label: client.name }]}
      />
      <Grid container spacing={3}>
        <Grid item xs={12} md={5}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>Client Details</Typography>
              {([
                ['Family Code', `${client.familyCode}/${client.persCode}`],
                ['Date of Birth', formatDate(client.dob)],
                ['Age', client.age ? `${client.age} years` : '—'],
                ['Sex', client.sex || '—'],
                ['Mobile', client.mobile || '—'],
                ['Email', client.email || '—'],
                ['Occupation', client.occupation || '—'],
                ['Client Type', client.clientType],
                ['Address', client.address || '—'],
              ] as [string, string][]).map(([label, value]) => (
                <Box key={label} display="flex" justifyContent="space-between" py={0.75} borderBottom="1px solid" borderColor="divider">
                  <Typography variant="body2" color="text.secondary">{label}</Typography>
                  <Typography variant="body2" fontWeight={500}>{value}</Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  );
}

export default function ClientDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const numId = typeof id === 'string' ? parseInt(id, 10) : 0;

  return (
    <PrivateRoute>
      <AppLayout title="Client Detail">
        {numId > 0 && <ClientDetailContent id={numId} />}
      </AppLayout>
    </PrivateRoute>
  );
}
