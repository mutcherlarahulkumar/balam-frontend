import React, { useState } from 'react';
import {
  Card, CardContent, Typography, Box, TextField, Button, Grid, Divider, Alert,
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import { useQuery } from '@tanstack/react-query';
import { gstApi } from '@/api/gst.api';
import { commissionApi } from '@/api/commission.api';
import PageHeader from '@/components/common/PageHeader';
import LoadingState from '@/components/common/LoadingState';
import { formatCurrency } from '@/utils/currency';

export default function GSTContainer() {
  const [policyNo, setPolicyNo] = useState('');
  const [premiumYear, setPremiumYear] = useState('1');
  const [submitted, setSubmitted] = useState<{ policyNo: number; premiumYear: number } | null>(null);

  const { data: gst, isLoading: gstLoading } = useQuery({
    queryKey: ['gst', submitted?.policyNo, submitted?.premiumYear],
    queryFn: () => gstApi.calculate(submitted!.policyNo, submitted!.premiumYear),
    enabled: !!submitted,
  });

  const { data: commission, isLoading: commLoading } = useQuery({
    queryKey: ['commission-calc', submitted?.policyNo, submitted?.premiumYear],
    queryFn: () => commissionApi.calculate(submitted!.policyNo, submitted!.premiumYear),
    enabled: !!submitted,
  });

  function handleCalculate() {
    const no = parseInt(policyNo, 10);
    const yr = parseInt(premiumYear, 10);
    if (!isNaN(no) && !isNaN(yr)) setSubmitted({ policyNo: no, premiumYear: yr });
  }

  return (
    <>
      <PageHeader title="GST & Commission Calculator" subtitle="Calculate GST and estimated commission for any policy" />

      <Alert severity="info" icon={<InfoIcon />} sx={{ mb: 3 }}>
        <strong>Current rule (post 22 Sep 2025):</strong> 0% GST on all individual LIC policies. Historical rates shown for reference.
      </Alert>

      <Card sx={{ mb: 3, maxWidth: 480 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} mb={2}>Calculate</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Policy Number"
                type="number"
                fullWidth
                value={policyNo}
                onChange={(e) => setPolicyNo(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Premium Year"
                type="number"
                fullWidth
                value={premiumYear}
                onChange={(e) => setPremiumYear(e.target.value)}
                helperText="1 = first year, 2 = renewal..."
              />
            </Grid>
          </Grid>
          <Button variant="contained" sx={{ mt: 2 }} onClick={handleCalculate} disabled={!policyNo}>
            Calculate
          </Button>
        </CardContent>
      </Card>

      {(gstLoading || commLoading) && <LoadingState message="Calculating..." />}

      {gst && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} mb={2}>GST Breakdown</Typography>
                {[
                  ['Policy No.', gst.policyNo],
                  ['Plan No.', gst.planNo],
                  ['Plan Type', gst.planType],
                  ['Base Premium', formatCurrency(gst.basePremium)],
                  ['GST Rate', `${gst.gstRate}%`],
                  ['GST Amount', formatCurrency(gst.gstAmount)],
                  ['Total Premium', formatCurrency(gst.totalPremium)],
                ].map(([label, value]) => (
                  <Box key={String(label)} display="flex" justifyContent="space-between" py={0.75} borderBottom="1px solid" borderColor="divider">
                    <Typography variant="body2" color="text.secondary">{label}</Typography>
                    <Typography variant="body2" fontWeight={600}>{String(value)}</Typography>
                  </Box>
                ))}
                <Divider sx={{ my: 1.5 }} />
                <Typography variant="caption" color="text.secondary">{gst.regulation}</Typography>
                {gst.historicalNote && (
                  <Typography variant="caption" color="text.disabled" display="block" mt={0.5}>{gst.historicalNote}</Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          {commission && (
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} mb={2}>Commission Estimate</Typography>
                  {[
                    ['Base Commission %', `${commission.baseCommissionPct}%`],
                    ['Bonus Commission %', `${commission.bonusCommissionPct}%`],
                    ['Total %', `${commission.totalPct}%`],
                    ['Estimated Commission', formatCurrency(commission.estimatedCommission)],
                  ].map(([label, value]) => (
                    <Box key={String(label)} display="flex" justifyContent="space-between" py={0.75} borderBottom="1px solid" borderColor="divider">
                      <Typography variant="body2" color="text.secondary">{label}</Typography>
                      <Typography variant="body2" fontWeight={600}>{String(value)}</Typography>
                    </Box>
                  ))}
                  <Divider sx={{ my: 1.5 }} />
                  <Typography variant="caption" color="text.secondary">{commission.note}</Typography>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      )}
    </>
  );
}
