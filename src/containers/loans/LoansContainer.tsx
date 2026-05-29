import React, { useState } from 'react';
import {
  Table, TableBody, TableCell, TableHead, TableRow, Paper, TableContainer, Box,
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

export default function LoansContainer() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { data, isLoading, isError, refetch } = useLoans();
  const createLoan = useCreateLoan();

  function handleSubmit(data: LoanFormData) {
    createLoan.mutate(data, { onSuccess: () => setDrawerOpen(false) });
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
        <EmptyState title="No loans" message="No loan records found." action={{ label: 'Add Loan', onClick: () => setDrawerOpen(true) }} />
      ) : (
        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Policy No.</TableCell>
                <TableCell>Loan Date</TableCell>
                <TableCell align="right">Loan Amount</TableCell>
                <TableCell>Interest Due Date</TableCell>
                <TableCell align="right">Interest</TableCell>
                <TableCell>Details</TableCell>
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
                  <TableCell>{l.details || '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <FormDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Add Loan Record">
        <LoanForm onSubmit={handleSubmit} loading={createLoan.isPending} onCancel={() => setDrawerOpen(false)} />
      </FormDrawer>
    </>
  );
}
