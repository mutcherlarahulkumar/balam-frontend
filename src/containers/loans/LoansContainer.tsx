import React, { useState } from 'react';
import {
  Table, TableBody, TableCell, TableHead, TableRow, Paper, TableContainer, Box,
  Grid, Card, CardContent, Typography, Divider, useMediaQuery, useTheme,
} from '@mui/material';
import { useLoans, useCreateLoan } from '@/hooks/useLoans';
import PageHeader from '@/components/common/PageHeader';
import LoadingState from '@/components/common/LoadingState';
import ErrorState from '@/components/common/ErrorState';
import EmptyState from '@/components/common/EmptyState';
import FormDrawer from '@/components/common/FormDrawer';
import LoanForm from '@/components/loans/LoanForm';
import { formatCurrency } from '@/utils/currency';
import { formatDate } from '@/utils/date';
import { LoanFormData } from '@/validations/loan.validation';
import { useToast } from '@/hooks/useToast';

export default function LoansContainer() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const toast = useToast();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { data, isLoading, isError, refetch } = useLoans();
  const createLoan = useCreateLoan();

  function handleSubmit(formData: LoanFormData) {
    createLoan.mutate(formData, {
      onSuccess: () => { toast.success('Loan record added'); setDrawerOpen(false); },
      onError: (err: any) => toast.error(err?.response?.data?.message ?? 'Failed to save loan'),
    });
  }

  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState onRetry={refetch} />;

  const loans = Array.isArray(data) ? data : [];

  return (
    <>
      <PageHeader
        title="Policy Loans"
        subtitle="Track loans taken against LIC policies"
        action={{ label: 'Add Loan', onClick: () => setDrawerOpen(true) }}
      />

      {!loans.length ? (
        <EmptyState
          title="No loans"
          message="No loan records found."
          action={{ label: 'Add Loan', onClick: () => setDrawerOpen(true) }}
        />
      ) : isMobile ? (
        <Grid container spacing={1.5}>
          {loans.map((l) => (
            <Grid item xs={12} key={l.id}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography
                      variant="subtitle1"
                      fontWeight={700}
                      sx={{ fontFamily: 'monospace' }}
                    >
                      Policy {l.policyNo}
                    </Typography>
                    <Typography variant="subtitle1" fontWeight={800} color="primary.main">
                      {formatCurrency(l.loanAmount)}
                    </Typography>
                  </Box>
                  <Divider sx={{ mb: 1 }} />
                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Loan Date</Typography>
                      <Typography variant="body2" fontWeight={600}>{formatDate(l.loanDate)}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Interest Due</Typography>
                      <Typography variant="body2" fontWeight={600}>{formatDate(l.interestDueDate)}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Loan Interest</Typography>
                      <Typography variant="body2">{formatCurrency(l.loanInterest)}</Typography>
                    </Grid>
                    {(l as any).details && (
                      <Grid item xs={12}>
                        <Typography variant="caption" color="text.secondary">Details</Typography>
                        <Typography variant="body2">{(l as any).details}</Typography>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}
        >
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Policy No.</TableCell>
                <TableCell>Loan Date</TableCell>
                <TableCell align="right">Loan Amount</TableCell>
                <TableCell>Interest Due Date</TableCell>
                <TableCell align="right">Interest</TableCell>
                <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>Details</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loans.map((l) => (
                <TableRow key={l.id} hover>
                  <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>{l.policyNo}</TableCell>
                  <TableCell>{formatDate(l.loanDate)}</TableCell>
                  <TableCell align="right">{formatCurrency(l.loanAmount)}</TableCell>
                  <TableCell>{formatDate(l.interestDueDate)}</TableCell>
                  <TableCell align="right">{formatCurrency(l.loanInterest)}</TableCell>
                  <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>
                    {(l as any).details || '—'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <FormDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Add Loan Record"
      >
        <LoanForm
          onSubmit={handleSubmit}
          loading={createLoan.isPending}
          onCancel={() => setDrawerOpen(false)}
        />
      </FormDrawer>
    </>
  );
}
