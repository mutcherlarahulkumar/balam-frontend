import AppLayout from '@/components/layout/AppLayout';
import PrivateRoute from '@/components/layout/PrivateRoute';
import ClientsContainer from '@/containers/clients/ClientsContainer';

export default function ClientsPage() {
  return (
    <PrivateRoute>
      <AppLayout title="Clients">
        <ClientsContainer />
      </AppLayout>
    </PrivateRoute>
  );
}
