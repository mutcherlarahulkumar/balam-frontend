import AppLayout from '@/components/layout/AppLayout';
import PrivateRoute from '@/components/layout/PrivateRoute';
import DashboardContainer from '@/containers/dashboard/DashboardContainer';

export default function DashboardPage() {
  return (
    <PrivateRoute>
      <AppLayout title="Dashboard">
        <DashboardContainer />
      </AppLayout>
    </PrivateRoute>
  );
}
