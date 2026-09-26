import { Redirect, Tabs } from 'expo-router';
import { TabBar } from '@/components/TabBar';
import { useAppStore } from '@/store/app';
import { colors } from '@/theme';

export default function TabsLayout() {
  const onboarded = useAppStore((s) => s.onboarded);
  const termsAcceptedAt = useAppStore((s) => s.termsAcceptedAt);
  if (!onboarded || !termsAcceptedAt) return <Redirect href="/onboarding" />;
  return (
    <Tabs
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: colors.cream } }}
      tabBar={(props) => <TabBar state={props.state} navigation={props.navigation as never} />}
    >
      <Tabs.Screen name="index" options={{ title: 'Jouer' }} />
      <Tabs.Screen name="rankings" options={{ title: 'Classements' }} />
      <Tabs.Screen name="lexik" options={{ title: 'Lexik' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profil' }} />
    </Tabs>
  );
}
