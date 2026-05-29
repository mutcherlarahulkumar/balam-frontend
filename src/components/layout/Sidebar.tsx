import React from 'react';
import {
  Box, List, ListItemButton, ListItemIcon, ListItemText,
  Typography, Divider,
} from '@mui/material';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import PolicyRoundedIcon from '@mui/icons-material/PolicyRounded';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import AccountBalanceRoundedIcon from '@mui/icons-material/AccountBalanceRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import SavingsRoundedIcon from '@mui/icons-material/SavingsRounded';
import ContactsRoundedIcon from '@mui/icons-material/ContactsRounded';
import EventNoteRoundedIcon from '@mui/icons-material/EventNoteRounded';
import AssessmentRoundedIcon from '@mui/icons-material/AssessmentRounded';
import CategoryRoundedIcon from '@mui/icons-material/CategoryRounded';
import PercentRoundedIcon from '@mui/icons-material/PercentRounded';
import { useRouter } from 'next/router';
import BalamLogo from '@/components/common/BalamLogo';

interface NavSection {
  section: string;
  items: Array<{ label: string; icon: React.ReactNode; href: string }>;
}

const NAV_SECTIONS: NavSection[] = [
  {
    section: 'Overview',
    items: [
      { label: 'Dashboard', icon: <DashboardRoundedIcon />, href: '/dashboard' },
    ],
  },
  {
    section: 'Portfolio',
    items: [
      { label: 'Families', icon: <PeopleRoundedIcon />, href: '/families' },
      { label: 'Clients', icon: <PersonRoundedIcon />, href: '/clients' },
      { label: 'Plans', icon: <CategoryRoundedIcon />, href: '/plans' },
      { label: 'Policies', icon: <PolicyRoundedIcon />, href: '/policies' },
    ],
  },
  {
    section: 'Operations',
    items: [
      { label: 'FUP Tracking', icon: <CalendarMonthRoundedIcon />, href: '/fup' },
      { label: 'Loans', icon: <AccountBalanceRoundedIcon />, href: '/loans' },
      { label: 'Survival Benefits', icon: <SavingsRoundedIcon />, href: '/sb' },
    ],
  },
  {
    section: 'Finance',
    items: [
      { label: 'Commission', icon: <TrendingUpRoundedIcon />, href: '/commission' },
      { label: 'GST Calculator', icon: <PercentRoundedIcon />, href: '/gst' },
      { label: 'Payments', icon: <PaymentsRoundedIcon />, href: '/payments' },
    ],
  },
  {
    section: 'Prospects',
    items: [
      { label: 'Leads', icon: <ContactsRoundedIcon />, href: '/leads' },
      { label: 'Activities', icon: <EventNoteRoundedIcon />, href: '/activities' },
    ],
  },
  {
    section: 'Analytics',
    items: [
      { label: 'Reports', icon: <AssessmentRoundedIcon />, href: '/reports' },
    ],
  },
];

interface Props {
  onNavigate: () => void;
}

export default function Sidebar({ onNavigate }: Props) {
  const router = useRouter();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
      {/* Brand */}
      <Box sx={{ p: 3, pb: 2, pt: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <BalamLogo size={44} />
        <Box>
          <Typography variant="h5" fontWeight={900} color="white" letterSpacing={-0.5}>
            Balam
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.55)', fontWeight: 500 }}>
            LIC Agent CRM
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.12)', mx: 2 }} />

      <List sx={{ px: 1.5, py: 1.5, flexGrow: 1 }}>
        {NAV_SECTIONS.map((section) => (
          <Box key={section.section} mb={0.5}>
            <Typography
              variant="caption"
              sx={{
                px: 1.5,
                py: 0.75,
                display: 'block',
                color: 'rgba(255,255,255,0.4)',
                fontWeight: 700,
                letterSpacing: 1,
                textTransform: 'uppercase',
                fontSize: '0.7rem',
              }}
            >
              {section.section}
            </Typography>
            {section.items.map((item) => {
              const active = router.pathname === item.href || router.pathname.startsWith(item.href + '/');
              return (
                <ListItemButton
                  key={item.href}
                  selected={active}
                  onClick={() => { router.push(item.href); onNavigate(); }}
                  sx={{
                    borderRadius: 2.5,
                    mb: 0.25,
                    minHeight: 48,
                    color: active ? 'white' : 'rgba(255,255,255,0.65)',
                    bgcolor: active ? 'rgba(255,255,255,0.18) !important' : 'transparent',
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.1)',
                      color: 'white',
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: 'inherit', minWidth: 38 }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontSize: '0.95rem',
                      fontWeight: active ? 700 : 500,
                    }}
                  />
                </ListItemButton>
              );
            })}
          </Box>
        ))}
      </List>
    </Box>
  );
}
