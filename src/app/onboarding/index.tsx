import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bulle } from '@/components/brand/Bulle';
import { Grain } from '@/components/brand/Grain';
import { Logo } from '@/components/brand/Logo';
import { Bob } from '@/components/brand/Motion';
import { Wax } from '@/components/brand/Wax';
import { Button, Chip, Txt } from '@/components/ui';
import { config } from '@/services/config';
import { colors } from '@/theme';

/** Écran d'accueil (splash de la maquette). */
export default function Welcome() {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const compact = height < 740;
  const logoWidth = Math.min(356, width - 34);

  return (
    <View style={{ flex: 1, backgroundColor: colors.lime, overflow: 'hidden' }}>
      <View
        style={{
          position: 'absolute',
          right: -70,
          top: -50,
          width: 290,
          height: compact ? 420 : 520,
          transform: [{ rotate: '10deg' }],
          borderWidth: 5,
          borderColor: colors.ink,
          overflow: 'hidden',
          zIndex: 0,
        }}
      >
        <Wax variant="color" />
      </View>
      <Bob style={{ position: 'absolute', right: 26, top: insets.top + (compact ? 70 : 100) }}>
        <Bulle color={colors.pink} mood="proud" acc="cap" size={compact ? 140 : 176} />
      </Bob>

      <View style={{ flex: 1, zIndex: 2, position: 'relative', paddingTop: insets.top + 24, paddingHorizontal: 22, paddingBottom: insets.bottom + 26 }}>
        <Txt variant="marker" size={20} tilt={-3} style={{ alignSelf: 'flex-start', backgroundColor: colors.lime, paddingHorizontal: 4 }}>
          l’argot, ça se joue
        </Txt>

        <View style={{ flex: 1, justifyContent: 'flex-end', paddingBottom: 18 }}>
          <View style={{ marginLeft: -8, transform: [{ rotate: '-4deg' }] }}>
            <Logo width={logoWidth} />
          </View>
          <Txt variant="bold" size={23} style={{ marginTop: 22, lineHeight: 28 }}>
            Le jeu qui prouve que tu parles comme ton quartier.
          </Txt>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 18 }}>
            <Chip label="Paris" bg={colors.pink} />
            <Chip label="Marseille" bg={colors.orange} />
            <Chip label="Bruxelles" bg={colors.blue} />
            <Chip label="Abidjan" bg={colors.violet} />
            <Chip label="Libreville" bg={colors.cream} />
          </View>
        </View>

        <View style={{ gap: 12 }}>
          <Button variant="cta" label="C'EST PARTI" bg={colors.ink} color={colors.lime} onPress={() => router.push('/onboarding/pseudo')} />
          <Button
            label="Règles et confidentialité"
            align="center"
            minHeight={46}
            contentStyle={{ paddingVertical: 10 }}
            onPress={() => WebBrowser.openBrowserAsync(config.privacyUrl).catch(() => undefined)}
          />
        </View>
      </View>
      <Grain />
    </View>
  );
}
