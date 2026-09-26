import { BricolageGrotesque_400Regular, BricolageGrotesque_600SemiBold, BricolageGrotesque_800ExtraBold } from '@expo-google-fonts/bricolage-grotesque';
import { DelaGothicOne_400Regular } from '@expo-google-fonts/dela-gothic-one';
import { PermanentMarker_400Regular } from '@expo-google-fonts/permanent-marker';
import { useFonts } from 'expo-font';
import { Stack, type ErrorBoundaryProps } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Bulle } from '@/components/brand/Bulle';
import { Button, Screen, ToastProvider, Txt } from '@/components/ui';
import { Bootstrap } from '@/features/Bootstrap';
import { useHydrated } from '@/hooks/useHydrated';
import { colors } from '@/theme';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

function ScreenErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  return (
    <Screen bg={colors.violet} contentStyle={{ alignItems: 'center', justifyContent: 'center' }}>
      <Bulle color={colors.cream} mood="shock" size={160} />
      <Txt variant="display" size={31} align="center" style={{ marginTop: 22 }}>
        Oups, ça a dérapé
      </Txt>
      <Txt align="center" style={{ marginTop: 10 }}>
        Réessaie. Si ça continue, ferme puis rouvre l’app.
      </Txt>
      {__DEV__ ? <Txt size={12} align="center" style={{ marginTop: 8 }}>{error.message}</Txt> : null}
      <Button variant="cta" label="RÉESSAYER" bg={colors.lime} style={{ marginTop: 24, alignSelf: 'stretch' }} onPress={() => retry()} />
    </Screen>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    DelaGothicOne_400Regular,
    BricolageGrotesque_400Regular,
    BricolageGrotesque_600SemiBold,
    BricolageGrotesque_800ExtraBold,
    PermanentMarker_400Regular,
  });
  const hydrated = useHydrated();
  const ready = (fontsLoaded || Boolean(fontError)) && hydrated;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => undefined);
  }, [ready]);

  if (!ready) return null;

  return (
    <SafeAreaProvider>
      <ToastProvider>
        <Bootstrap />
        <StatusBar style="dark" />
        <Stack
          unstable_screenErrorBoundary={ScreenErrorBoundary}
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.cream },
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
          <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
          <Stack.Screen name="game/play" options={{ gestureEnabled: false, animation: 'fade' }} />
          <Stack.Screen name="game/result" options={{ gestureEnabled: false, animation: 'fade' }} />
          <Stack.Screen name="game/ad" options={{ presentation: 'fullScreenModal', gestureEnabled: false, animation: 'fade' }} />
          <Stack.Screen name="city/opened" options={{ gestureEnabled: false, animation: 'fade' }} />
          <Stack.Screen name="invite" options={{ presentation: 'transparentModal', animation: 'fade' }} />
          <Stack.Screen name="expression/[key]" options={{ presentation: 'transparentModal', animation: 'fade' }} />
        </Stack>
      </ToastProvider>
    </SafeAreaProvider>
  );
}
