import React, { useState } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  useTheme,
  useMediaQuery,
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  Tooltip,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PolicyIcon from '@mui/icons-material/Policy';
import PeopleIcon from '@mui/icons-material/People';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AppsIcon from '@mui/icons-material/Apps';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import Sidebar from './Sidebar';

const DRAWER_WIDTH = 256;

const BOTTOM_NAV = [
  { label: 'Dashboard', icon: <DashboardIcon />, href: '/dashboard' },
  { label: 'Policies', icon: <PolicyIcon />, href: '/policies' },
  { label: 'FUP', icon: <CalendarMonthIcon />, href: '/fup' },
  { label: 'Families', icon: <PeopleIcon />, href: '/families' },
  { label: 'More', icon: <AppsIcon />, href: '__menu__' },
];

interface Props {
  children: React.ReactNode;
  title?: string;
}

export default function AppLayout({ children, title }: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { agent, logout } = useAuth();
  const router = useRouter();

  const currentBottomNav = BOTTOM_NAV.findIndex(
    (n) => n.href !== '__menu__' && router.pathname.startsWith(n.href),
  );

  function handleBottomNav(_: React.SyntheticEvent, newValue: number) {
    const item = BOTTOM_NAV[newValue];
    if (!item) return;
    if (item.href === '__menu__') {
      setMobileOpen(true);
    } else {
      router.push(item.href);
    }
  }

  function handleLogout() {
    logout();
    router.push('/login');
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          bgcolor: 'white',
          borderBottom: '3px solid',
          borderColor: 'primary.main',
          color: 'text.primary',
          zIndex: theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar sx={{ minHeight: { xs: 60, md: 64 }, px: { xs: 1.5, sm: 2 } }}>
          {isMobile && (
            <IconButton
              edge="start"
              onClick={() => setMobileOpen(true)}
              sx={{ mr: 1, color: 'primary.main' }}
              size="large"
            >
              <MenuIcon fontSize="medium" />
            </IconButton>
          )}
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main', lineHeight: 1.1 }}>
              {isMobile ? 'Balam' : (title ?? 'Balam CRM')}
            </Typography>
            {isMobile && title && (
              <Typography variant="caption" color="text.secondary" display="block" sx={{ lineHeight: 1 }}>
                {title}
              </Typography>
            )}
          </Box>
          <Tooltip title="Profile & Sign Out">
            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} size="large">
              <Avatar sx={{ width: 40, height: 40, bgcolor: 'primary.main', fontSize: 17, fontWeight: 700 }}>
                {agent?.name?.[0]?.toUpperCase() ?? 'A'}
              </Avatar>
            </IconButton>
          </Tooltip>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
            <Box sx={{ px: 2.5, py: 1.5 }}>
              <Typography variant="subtitle1" fontWeight={700}>{agent?.name}</Typography>
              <Typography variant="body2" color="text.secondary">{agent?.agentCode} · {agent?.branch}</Typography>
            </Box>
            <Divider />
            <MenuItem onClick={() => { setAnchorEl(null); router.push('/profile'); }} sx={{ py: 1.5, gap: 1.5 }}>
              <AccountCircleIcon color="primary" /> My Profile
            </MenuItem>
            <MenuItem onClick={handleLogout} sx={{ color: 'error.main', py: 1.5, gap: 1.5 }}>
              <LogoutIcon /> Sign Out
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Desktop Sidebar — hidden on mobile */}
      <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: 0, display: { xs: 'none', md: 'block' } }}>
        <Drawer
          variant="permanent"
          open
          sx={{
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              bgcolor: 'primary.main',
              color: 'white',
              border: 'none',
            },
          }}
        >
          <Sidebar onNavigate={() => {}} />
        </Drawer>
      </Box>

      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH, bgcolor: 'primary.main', color: 'white' },
        }}
      >
        <Sidebar onNavigate={() => setMobileOpen(false)} />
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 1.5, sm: 2, md: 3 },
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          mt: { xs: '60px', md: '64px' },
          mb: { xs: '72px', md: 0 },
        }}
      >
        {children}
      </Box>

      {/* Mobile bottom navigation bar */}
      {isMobile && (
        <Paper
          elevation={12}
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: theme.zIndex.appBar,
            borderTop: '1px solid',
            borderColor: 'divider',
          }}
        >
          <BottomNavigation
            value={currentBottomNav >= 0 ? currentBottomNav : false}
            onChange={handleBottomNav}
            showLabels
            sx={{ height: 72 }}
          >
            {BOTTOM_NAV.map((item) => (
              <BottomNavigationAction
                key={item.href}
                label={item.label}
                icon={item.icon}
                sx={{
                  color: 'text.secondary',
                  '&.Mui-selected': { color: 'primary.main' },
                  minWidth: 0,
                }}
              />
            ))}
          </BottomNavigation>
        </Paper>
      )}
    </Box>
  );
}
