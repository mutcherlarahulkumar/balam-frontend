import AppLayout from '@/components/layout/AppLayout';
import PrivateRoute from '@/components/layout/PrivateRoute';
import CommissionContainer from '@/containers/commission/CommissionContainer';

export default function CommissionPage() {
  return (
    <PrivateRoute>
      <AppLayout title="Commission">
        <CommissionContainer />
      </AppLayout>
    </PrivateRoute>
  );
}
