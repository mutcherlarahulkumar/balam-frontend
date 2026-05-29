import AppLayout from '@/components/layout/AppLayout';
import PrivateRoute from '@/components/layout/PrivateRoute';
import ProfileContainer from '@/containers/profile/ProfileContainer';

export default function ProfilePage() {
  return (
    <PrivateRoute>
      <AppLayout title="Profile">
        <ProfileContainer />
      </AppLayout>
    </PrivateRoute>
  );
}
