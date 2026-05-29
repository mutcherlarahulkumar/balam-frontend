import AppLayout from '@/components/layout/AppLayout';
import PrivateRoute from '@/components/layout/PrivateRoute';
import LeadsContainer from '@/containers/leads/LeadsContainer';

export default function LeadsPage() {
  return (
    <PrivateRoute>
      <AppLayout title="Leads">
        <LeadsContainer />
      </AppLayout>
    </PrivateRoute>
  );
}
