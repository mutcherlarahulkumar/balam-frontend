import AppLayout from '@/components/layout/AppLayout';
import PrivateRoute from '@/components/layout/PrivateRoute';
import FUPContainer from '@/containers/fup/FUPContainer';

export default function FUPPage() {
  return (
    <PrivateRoute>
      <AppLayout title="FUP Tracking">
        <FUPContainer />
      </AppLayout>
    </PrivateRoute>
  );
}
