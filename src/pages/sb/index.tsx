import AppLayout from '@/components/layout/AppLayout';
import PrivateRoute from '@/components/layout/PrivateRoute';
import SBContainer from '@/containers/sb/SBContainer';

export default function SBPage() {
  return (
    <PrivateRoute>
      <AppLayout title="Survival Benefits">
        <SBContainer />
      </AppLayout>
    </PrivateRoute>
  );
}
