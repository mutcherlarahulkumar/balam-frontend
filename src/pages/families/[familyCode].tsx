import { useRouter } from 'next/router';
import AppLayout from '@/components/layout/AppLayout';
import PrivateRoute from '@/components/layout/PrivateRoute';
import FamilyDetailContainer from '@/containers/families/FamilyDetailContainer';

export default function FamilyDetailPage() {
  const router = useRouter();
  const { familyCode } = router.query;

  if (!familyCode || typeof familyCode !== 'string') return null;

  return (
    <PrivateRoute>
      <AppLayout title="Family Detail">
        <FamilyDetailContainer familyCode={familyCode} />
      </AppLayout>
    </PrivateRoute>
  );
}
