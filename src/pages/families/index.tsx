import AppLayout from '@/components/layout/AppLayout';
import PrivateRoute from '@/components/layout/PrivateRoute';
import FamiliesContainer from '@/containers/families/FamiliesContainer';

export default function FamiliesPage() {
  return (
    <PrivateRoute>
      <AppLayout title="Families">
        <FamiliesContainer />
      </AppLayout>
    </PrivateRoute>
  );
}
