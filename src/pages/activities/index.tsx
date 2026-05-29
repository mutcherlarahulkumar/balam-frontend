import AppLayout from '@/components/layout/AppLayout';
import PrivateRoute from '@/components/layout/PrivateRoute';
import ActivitiesContainer from '@/containers/activities/ActivitiesContainer';

export default function ActivitiesPage() {
  return (
    <PrivateRoute>
      <AppLayout title="Activities">
        <ActivitiesContainer />
      </AppLayout>
    </PrivateRoute>
  );
}
