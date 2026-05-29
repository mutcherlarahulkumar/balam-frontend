import AppLayout from '@/components/layout/AppLayout';
import PrivateRoute from '@/components/layout/PrivateRoute';
import LoansContainer from '@/containers/loans/LoansContainer';

export default function LoansPage() {
  return (
    <PrivateRoute>
      <AppLayout title="Loans">
        <LoansContainer />
      </AppLayout>
    </PrivateRoute>
  );
}
