import { Redirect } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import LoadingState from '@/components/common/LoadingState';

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <LoadingState />;
  return <Redirect href={isAuthenticated ? '/(app)/(tabs)/dashboard' : '/(auth)/login'} />;
}
