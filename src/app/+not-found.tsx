import { router } from 'expo-router';
import { View } from 'react-native';
import { Bulle } from '@/components/brand/Bulle';
import { Button, Screen, Txt } from '@/components/ui';
import { colors } from '@/theme';

export default function NotFound() {
  return (
    <Screen bg={colors.violet} contentStyle={{ alignItems: 'center' }}>
      <View style={{ marginTop: 80 }}>
        <Bulle color={colors.cream} mood="shock" size={170} />
      </View>
      <Txt variant="display" size={34} align="center" style={{ marginTop: 20 }}>
        Wesh, t’es perdu ?
      </Txt>
      <Txt size={16} align="center" style={{ marginTop: 10 }}>
        Cette page n’existe pas (ou plus).
      </Txt>
      <Button variant="cta" label="RETOUR À L'ACCUEIL" bg={colors.ink} color={colors.lime} style={{ marginTop: 30, alignSelf: 'stretch' }} onPress={() => router.replace('/')} />
    </Screen>
  );
}
