import AppLayout from '@/components/layout/AppLayout';
import PrivateRoute from '@/components/layout/PrivateRoute';
import GSTContainer from '@/containers/gst/GSTContainer';

export default function GSTPage() {
  return (
    <PrivateRoute>
      <AppLayout title="GST Calculator">
        <GSTContainer />
      </AppLayout>
    </PrivateRoute>
  );
}
