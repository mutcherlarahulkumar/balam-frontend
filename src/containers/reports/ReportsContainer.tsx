import React, { useState } from 'react';
import {
  Grid, Card, CardContent, Typography, Box, TextField, Button, Tab, Tabs,
  Table, TableBody, TableCell, TableHead, TableRow, TableContainer, Chip,
  useMediaQuery, useTheme,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import {
  useCashflow, useCashInOut, useStatusReport, useCalendar, useRefreshReports,
} from '@/hooks/useReports';
import PageHeader from '@/components/common/PageHeader';
import LoadingState from '@/components/common/LoadingState';
import EmptyState from '@/components/common/EmptyState';
import { formatCurrency } from '@/utils/currency';

export default function ReportsContainer() {
  const [familyCode, setFamilyCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [tab, setTab] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const { data: cashflow, isLoading: cfLoading } = useCashflow(familyCode);
  const { data: cashinout } = useCashInOut();
  const { data: status } = useStatusReport(familyCode);
  const { data: calendar } = useCalendar(familyCode);
  const refreshReports = useRefreshReports();

  function handleLoad() {
    setFamilyCode(inputCode.trim());
  }

  return (
    <>
      <PageHeader
        title="Reports"
        subtitle="Family cash flow, status snapshots, and premium calendars"
      />

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box
            display="flex"
            flexDirection={{ xs: 'column', sm: 'row' }}
            gap={2}
            alignItems={{ xs: 'stretch', sm: 'center' }}
          >
            <TextField
              label="Family Code"
              size="small"
              fullWidth
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleLoad(); }}
              placeholder="e.g. F001"
              sx={{ maxWidth: { sm: 240 } }}
            />
            <Button
              variant="contained"
              size="large"
              sx={{ minHeight: 44, flexShrink: 0 }}
              onClick={handleLoad}
              disabled={!inputCode}
            >
              Load
            </Button>
            {familyCode && (
              <Button
                variant="outlined"
                size="large"
                startIcon={<RefreshIcon />}
                sx={{ minHeight: 44, flexShrink: 0 }}
                onClick={() => refreshReports.mutate(familyCode)}
                disabled={refreshReports.isPending}
              >
                Refresh Cache
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>

      <Box sx={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          variant={isMobile ? 'scrollable' : 'standard'}
          scrollButtons={isMobile ? 'auto' : false}
          allowScrollButtonsMobile
          sx={{ mb: 3, minWidth: 0 }}
        >
          <Tab label="Cash Flow" />
          <Tab label="Cash In/Out" />
          <Tab label="Policy Status" />
          <Tab label="Premium Calendar" />
        </Tabs>
      </Box>

      {tab === 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={600} mb={2}>
              Year-by-Year Cash Flow{familyCode ? ` — ${familyCode}` : ''}
            </Typography>
            {cfLoading ? (
              <LoadingState />
            ) : !cashflow?.length ? (
              <EmptyState title="No data" message="Enter a family code and click Load." />
            ) : (
              <Box sx={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                <Box sx={{ minWidth: 320 }}>
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={cashflow}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                      <Tooltip formatter={(v: number) => formatCurrency(v)} />
                      <Legend />
                      <Bar dataKey="sbAmount" name="SB Amount" fill="#1a3c5e" />
                      <Bar dataKey="maturityAmount" name="Maturity" fill="#d4821a" />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {tab === 1 && (
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={600} mb={2}>Net Cash In vs Out</Typography>
            {!cashinout?.length ? (
              <EmptyState title="No data" message="No cash flow data available." />
            ) : (
              <Box sx={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                <Box sx={{ minWidth: 320 }}>
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={cashinout}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                      <Tooltip formatter={(v: number) => formatCurrency(v)} />
                      <Legend />
                      <Bar dataKey="cashIn" name="Cash In" fill="#2e7d32" />
                      <Bar dataKey="cashOut" name="Cash Out" fill="#d32f2f" />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {tab === 2 && (
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={600} mb={2}>
              Policy Status Snapshot{familyCode ? ` — ${familyCode}` : ''}
            </Typography>
            {!status?.length ? (
              <EmptyState title="No data" message="Enter a family code and click Load." />
            ) : (
              <Box sx={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                <Table size="small" sx={{ minWidth: 560 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Policy No.</TableCell>
                      <TableCell>Plan</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Premium Paid</TableCell>
                      <TableCell align="right" sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                        Bonus
                      </TableCell>
                      <TableCell align="right" sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                        Surrender Value
                      </TableCell>
                      <TableCell align="right">Loan</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {status.map((s) => (
                      <TableRow key={s.policyNo} hover>
                        <TableCell sx={{ fontFamily: 'monospace' }}>{s.policyNo}</TableCell>
                        <TableCell>
                          <Typography variant="body2" noWrap sx={{ maxWidth: 120 }}>
                            {s.planName}
                          </Typography>
                        </TableCell>
                        <TableCell><Chip label={s.status} size="small" /></TableCell>
                        <TableCell align="right">{formatCurrency(s.premiumPaid)}</TableCell>
                        <TableCell
                          align="right"
                          sx={{ display: { xs: 'none', sm: 'table-cell' } }}
                        >
                          {formatCurrency(s.bonus)}
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{ display: { xs: 'none', md: 'table-cell' } }}
                        >
                          {formatCurrency(s.surrenderValue)}
                        </TableCell>
                        <TableCell align="right">{formatCurrency(s.loan)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {tab === 3 && (
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={600} mb={2}>
              12-Month Premium Calendar{familyCode ? ` — ${familyCode}` : ''}
            </Typography>
            {!calendar?.length ? (
              <EmptyState title="No data" message="Enter a family code and click Load." />
            ) : (
              <Grid container spacing={2}>
                {calendar.map((entry) => (
                  <Grid item xs={12} sm={6} md={4} key={entry.month}>
                    <Card variant="outlined">
                      <CardContent sx={{ pb: '12px !important' }}>
                        <Box display="flex" justifyContent="space-between" mb={1}>
                          <Typography variant="subtitle2" fontWeight={700}>{entry.month}</Typography>
                          <Typography variant="subtitle2" color="secondary.main" fontWeight={700}>
                            {formatCurrency(entry.totalPremium)}
                          </Typography>
                        </Box>
                        {entry.policies.map((p) => (
                          <Box key={p.policyNo} display="flex" justifyContent="space-between" py={0.5}>
                            <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                              {p.policyNo}
                            </Typography>
                            <Typography variant="caption">{formatCurrency(p.premium)}</Typography>
                          </Box>
                        ))}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </CardContent>
        </Card>
      )}
    </>
  );
}
