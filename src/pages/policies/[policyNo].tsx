import { useRouter } from 'next/router';
import AppLayout from '@/components/layout/AppLayout';
import PrivateRoute from '@/components/layout/PrivateRoute';
import { usePolicy } from '@/hooks/usePolicies';
import { useFUPHistory, useMultipleDue } from '@/hooks/useFUP';
import LoadingState from '@/components/common/LoadingState';
import ErrorState from '@/components/common/ErrorState';
import PageHeader from '@/components/common/PageHeader';
import { PolicyStatusChip, FUPStatusChip } from '@/components/common/StatusChip';
import { formatCurrency } from '@/utils/currency';
import { formatDate } from '@/utils/date';
import {
  Grid, Card, CardContent, Typography, Box, Table, TableBody,
  TableCell, TableHead, TableRow, TableContainer, Chip,
} from '@mui/material';

function PolicyDetailContent({ policyNo }: { policyNo: number }) {
  const { data: policy, isLoading, isError, refetch } = usePolicy(policyNo);
  const { data: fupHistory } = useFUPHistory(policyNo);
  const { data: multipleDue } = useMultipleDue(policyNo);

  if (isLoading) return <LoadingState />;
  if (isError || !policy) return <ErrorState onRetry={refetch} />;

  return (
    <>
      <PageHeader
        title={`Policy ${policy.policyNo}`}
        subtitle={policy.clientName}
        breadcrumbs={[{ label: 'Policies', href: '/policies' }, { label: String(policy.policyNo) }]}
      />
      <Grid container spacing={3}>
        <Grid item xs={12} md={5}>
          <Card>
            <CardContent>
              <Box display="flex" gap={1} mb={2}>
                <PolicyStatusChip status={policy.status} />
                <FUPStatusChip status={policy.fupStatus} />
                {policy.daysUntilLapse < 90 && (
                  <Chip label={`Lapses in ${policy.daysUntilLapse}d`} size="small" color={policy.daysUntilLapse < 30 ? 'error' : 'warning'} />
                )}
              </Box>
              {([
                ['Policy No.', String(policy.policyNo)],
                ['Family Code', policy.familyCode],
                ['Plan', `${policy.planNo} — ${policy.planName}`],
                ['Term / PPT', `${policy.term}yr / ${policy.ppt}yr`],
                ['Sum Assured', formatCurrency(policy.sumAssured)],
                ['Premium', formatCurrency(policy.premium)],
                ['Payment Mode', policy.paymentMode],
                ['Issue Date', '—'],
                ['Maturity Date', formatDate(policy.matDate)],
                ['Next Premium', formatDate(policy.nextPremium)],
              ] as [string, string][]).map(([label, value]) => (
                <Box key={label} display="flex" justifyContent="space-between" py={0.75} borderBottom="1px solid" borderColor="divider">
                  <Typography variant="body2" color="text.secondary">{label}</Typography>
                  <Typography variant="body2" fontWeight={500}>{value}</Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={7}>
          {fupHistory?.history && fupHistory.history.length > 0 && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight={600} mb={2}>FUP History</Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Old FUP</TableCell>
                        <TableCell>New FUP</TableCell>
                        <TableCell>Updated By</TableCell>
                        <TableCell>Updated At</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {fupHistory.history.map((h) => (
                        <TableRow key={h.id}>
                          <TableCell>{formatDate(h.oldFup)}</TableCell>
                          <TableCell>{formatDate(h.newFup)}</TableCell>
                          <TableCell>{h.updatedBy}</TableCell>
                          <TableCell>{formatDate(h.updatedAt)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          )}

          {multipleDue?.dues && multipleDue.dues.length > 0 && (
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} mb={2}>Arrears</Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Inst. No.</TableCell>
                        <TableCell>Due Date</TableCell>
                        <TableCell align="right">Interest</TableCell>
                        <TableCell align="right">Total</TableCell>
                        <TableCell>Valid Upto</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {multipleDue.dues.map((d) => (
                        <TableRow key={d.id}>
                          <TableCell>{d.instNo}</TableCell>
                          <TableCell>{formatDate(d.dueDate)}</TableCell>
                          <TableCell align="right">{formatCurrency(d.intAmt)}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700 }}>{formatCurrency(d.totalAmt)}</TableCell>
                          <TableCell>{formatDate(d.validUpto)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </>
  );
}

export default function PolicyDetailPage() {
  const router = useRouter();
  const { policyNo } = router.query;
  const num = typeof policyNo === 'string' ? parseInt(policyNo, 10) : 0;

  return (
    <PrivateRoute>
      <AppLayout title="Policy Detail">
        {num > 0 && <PolicyDetailContent policyNo={num} />}
      </AppLayout>
    </PrivateRoute>
  );
}
