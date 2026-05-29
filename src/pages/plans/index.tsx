import AppLayout from '@/components/layout/AppLayout';
import PrivateRoute from '@/components/layout/PrivateRoute';
import PlansContainer from '@/containers/plans/PlansContainer';

export default function PlansPage() {
  return (
    <PrivateRoute>
      <AppLayout title="Plan Catalogue">
        <PlansContainer />
      </AppLayout>
    </PrivateRoute>
  );
}
