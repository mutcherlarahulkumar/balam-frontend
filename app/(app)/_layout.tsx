import { Stack } from 'expo-router';

export default function AppLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="family/[code]" options={{ headerShown: true, title: 'Family Detail', presentation: 'card' }} />
      <Stack.Screen name="family/new" options={{ headerShown: true, title: 'Add Family', presentation: 'modal' }} />
      <Stack.Screen name="client/[id]" options={{ headerShown: true, title: 'Client Detail', presentation: 'card' }} />
      <Stack.Screen name="client/new" options={{ headerShown: true, title: 'Add Client', presentation: 'modal' }} />
      <Stack.Screen name="policy/[policyNo]" options={{ headerShown: true, title: 'Policy Detail', presentation: 'card' }} />
      <Stack.Screen name="policy/new" options={{ headerShown: true, title: 'Add Policy', presentation: 'modal' }} />
      <Stack.Screen name="commission" options={{ headerShown: true, title: 'Commission', presentation: 'card' }} />
    </Stack>
  );
}
