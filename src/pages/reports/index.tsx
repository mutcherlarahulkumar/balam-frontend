import AppLayout from '@/components/layout/AppLayout';
import PrivateRoute from '@/components/layout/PrivateRoute';
import ReportsContainer from '@/containers/reports/ReportsContainer';

export default function ReportsPage() {
  return (
    <PrivateRoute>
      <AppLayout title="Reports">
        <ReportsContainer />
      </AppLayout>
    </PrivateRoute>
  );
}
