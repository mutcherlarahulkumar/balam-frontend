import React, { useState } from 'react';
import {
  Grid, Card, CardContent, Typography, Box, Chip,
  TextField, InputAdornment, FormControl, InputLabel, Select, MenuItem,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { usePlans } from '@/hooks/usePlans';
import PageHeader from '@/components/common/PageHeader';
import LoadingState from '@/components/common/LoadingState';
import EmptyState from '@/components/common/EmptyState';

const PLAN_TYPES = [
  'Endowment Type',
  'Money Back Type',
  'Children Plan Type',
  'Term Insurance',
  'Annuity Type',
  'Unit Linked',
  'Whole-Life',
  'Health',
];

export default function PlansContainer() {
  const [search, setSearch] = useState('');
  const [planType, setPlanType] = useState('');
  const { data, isLoading } = usePlans({ search, type: planType });

  if (isLoading) return <LoadingState />;

  const plans = data?.data ?? [];

  return (
    <>
      <PageHeader title="Plan Catalogue" subtitle={`${plans.length} LIC plans`} />
      <Box display="flex" gap={2} mb={3} flexWrap="wrap">
        <TextField
          size="small"
          placeholder="Search plans..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
          sx={{ minWidth: 240 }}
        />
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Plan Type</InputLabel>
          <Select value={planType} label="Plan Type" onChange={(e) => setPlanType(e.target.value)}>
            <MenuItem value="">All Types</MenuItem>
            {PLAN_TYPES.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
          </Select>
        </FormControl>
      </Box>

      {!plans.length ? (
        <EmptyState title="No plans found" message="Try adjusting your search filters." />
      ) : (
        <Grid container spacing={2}>
          {plans.map((plan) => (
            <Grid item xs={12} sm={6} md={4} key={plan.planNo}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                    <Chip label={`Plan ${plan.planNo}`} size="small" color="primary" variant="outlined" />
                    <Chip label={plan.planType} size="small" variant="outlined" />
                  </Box>
                  <Typography variant="subtitle1" fontWeight={700} mt={1}>{plan.planName}</Typography>
                  <Box mt={1.5} display="flex" flexDirection="column" gap={0.5}>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="caption" color="text.secondary">GST (First Year)</Typography>
                      <Typography variant="caption" fontWeight={600}>
                        {plan.gstRates?.firstYear === 0 ? '0% (exempt)' : `${plan.gstRates?.firstYear}%`}
                      </Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="caption" color="text.secondary">Lapse Days</Typography>
                      <Typography variant="caption" fontWeight={600}>{plan.lapsDays}d</Typography>
                    </Box>
                    {plan.sbSchedule?.length > 0 && (
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="caption" color="text.secondary">SB Payouts</Typography>
                        <Typography variant="caption" fontWeight={600}>{plan.sbSchedule.length} instalments</Typography>
                      </Box>
                    )}
                    {plan.termPpt && (
                      <Chip label="Term = PPT" size="small" color="info" variant="outlined" sx={{ width: 'fit-content', mt: 0.5 }} />
                    )}
                  </Box>
                  {plan.gstRates?.note && (
                    <Typography variant="caption" color="text.secondary" display="block" mt={1} sx={{ fontStyle: 'italic' }}>
                      {plan.gstRates.note}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </>
  );
}
