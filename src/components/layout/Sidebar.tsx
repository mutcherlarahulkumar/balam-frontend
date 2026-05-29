import React from 'react';
import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';
import PolicyIcon from '@mui/icons-material/Policy';
import PaymentsIcon from '@mui/icons-material/Payments';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import SavingsIcon from '@mui/icons-material/Savings';
import ContactsIcon from '@mui/icons-material/Contacts';
import EventNoteIcon from '@mui/icons-material/EventNote';
import AssessmentIcon from '@mui/icons-material/Assessment';
import CategoryIcon from '@mui/icons-material/Category';
import PercentIcon from '@mui/icons-material/Percent';
import { useRouter } from 'next/router';

interface NavItem {
  label: string;
  icon: React.ReactNode;
  href: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', icon: <DashboardIcon />, href: '/dashboard' },
  { label: 'Families', icon: <PeopleIcon />, href: '/families' },
  { label: 'Clients', icon: <PersonIcon />, href: '/clients' },
  { label: 'Plans', icon: <CategoryIcon />, href: '/plans' },
  { label: 'Policies', icon: <PolicyIcon />, href: '/policies' },
  { label: 'FUP Tracking', icon: <CalendarMonthIcon />, href: '/fup' },
  { label: 'Commission', icon: <TrendingUpIcon />, href: '/commission' },
  { label: 'GST Calculator', icon: <PercentIcon />, href: '/gst' },
  { label: 'Loans', icon: <AccountBalanceIcon />, href: '/loans' },
  { label: 'Survival Benefits', icon: <SavingsIcon />, href: '/sb' },
  { label: 'Leads', icon: <ContactsIcon />, href: '/leads' },
  { label: 'Activities', icon: <EventNoteIcon />, href: '/activities' },
  { label: 'Reports', icon: <AssessmentIcon />, href: '/reports' },
  { label: 'Payments', icon: <PaymentsIcon />, href: '/payments' },
];

interface Props {
  onNavigate: () => void;
}

export default function Sidebar({ onNavigate }: Props) {
  const router = useRouter();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ p: 3, pb: 2 }}>
        <Typography variant="h5" fontWeight={800} color="white">
          Balam
        </Typography>
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
          LIC Agent CRM
        </Typography>
      </Box>
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.15)' }} />
      <List sx={{ px: 1, py: 1, flexGrow: 1, overflowY: 'auto' }}>
        {NAV_ITEMS.map((item) => {
          const active = router.pathname.startsWith(item.href);
          return (
            <ListItemButton
              key={item.href}
              selected={active}
              onClick={() => { router.push(item.href); onNavigate(); }}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                color: active ? 'white' : 'rgba(255,255,255,0.7)',
                bgcolor: active ? 'rgba(255,255,255,0.15) !important' : 'transparent',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.1)', color: 'white' },
              }}
            >
              <ListItemIcon sx={{ color: 'inherit', minWidth: 36 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: 14, fontWeight: active ? 700 : 400 }} />
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );
}
