import AppLayout from '@/components/layout/AppLayout';
import PrivateRoute from '@/components/layout/PrivateRoute';
import PoliciesContainer from '@/containers/policies/PoliciesContainer';

export default function PoliciesPage() {
  return (
    <PrivateRoute>
      <AppLayout title="Policies">
        <PoliciesContainer />
      </AppLayout>
    </PrivateRoute>
  );
}
