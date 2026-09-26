import { router } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';
import { Bulle } from '@/components/brand/Bulle';
import { Bob, Pop } from '@/components/brand/Motion';
import { Wax } from '@/components/brand/Wax';
import { Brutal, Button, Screen, Txt } from '@/components/ui';
import { success } from '@/services/haptics';
import { shareText } from '@/services/share';
import { config } from '@/services/config';
import { useAppStore } from '@/store/app';
import { colors } from '@/theme';

/** Fête d'ouverture d'une ville (badge Fondateur). */
export default function CityOpened() {
  const city = useAppStore((s) => s.city);
  const markSeen = useAppStore((s) => s.markCityOpenedSeen);

  useEffect(() => {
    success();
    markSeen();
  }, [markSeen]);

  return (
    <Screen bg={colors.lime} background={<Wax variant="ink" opacity={0.13} />} contentStyle={{ alignItems: 'center' }}>
      <Txt variant="label" style={{ marginTop: 16 }}>
        Nouvelle ville dans le jeu
      </Txt>
      <Pop style={{ marginTop: 14 }}>
        <Txt variant="display" size={40} align="center">
          {city.toUpperCase()}
          {'\n'}EST OUVERTE !
        </Txt>
      </Pop>
      <Bob style={{ marginTop: 18 }}>
        <Bulle color={colors.pink} mood="proud" acc="crown" size={170} />
      </Bob>
      <Brutal bg={colors.pink} tilt={-3} style={{ marginTop: 16 }} contentStyle={{ paddingVertical: 12, paddingHorizontal: 20 }}>
        <Txt variant="label" size={11}>
          Badge débloqué
        </Txt>
        <Txt variant="display" size={22}>
          Fondateur · {city}
        </Txt>
      </Brutal>
      <Txt size={16} align="center" style={{ marginTop: 18 }}>
        Bienvenue dans la Guerre des villes. Ton pseudo reste gravé sur la fiche de {city}.
      </Txt>
      <View style={{ alignSelf: 'stretch', gap: 12, marginTop: 20 }}>
        <Button variant="cta" label="VOIR LE CLASSEMENT" bg={colors.ink} color={colors.lime} onPress={() => router.replace('/rankings')} />
        <Button
          label="Partager la nouvelle"
          align="center"
          onPress={() => shareText(`${city} est ouverte sur Tu parles jeune ? Viens jouer pour la team !`, config.shareBaseUrl)}
        />
      </View>
    </Screen>
  );
}
