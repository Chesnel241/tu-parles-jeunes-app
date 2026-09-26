import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bulle } from '@/components/brand/Bulle';
import { Bob, FadeIn, Pop } from '@/components/brand/Motion';
import { Button, Chip, Txt } from '@/components/ui';
import { rewardFor } from '@/logic/game';
import { useAppStore } from '@/store/app';
import { scoreOf, useGameStore } from '@/store/game';
import { colors } from '@/theme';

/**
 * Pub récompensée SIMULÉE : utilisée uniquement en développement ou en mode démo,
 * quand le vrai module AdMob n'est pas disponible (Expo Go, navigateur).
 * En production, c'est la vraie pub Google qui s'affiche en plein écran.
 */
export default function DemoRewardedAd() {
  const insets = useSafeAreaInsets();
  const [left, setLeft] = useState(5);
  const coins = rewardFor(scoreOf(useGameStore.getState())).coins;

  useEffect(() => {
    if (left <= 0) return undefined;
    const t = setTimeout(() => setLeft((l) => l - 1), 1000);
    return () => clearTimeout(t);
  }, [left]);

  const claim = () => {
    if (!useGameStore.getState().doubled) {
      useAppStore.getState().addCoins(coins);
      useGameStore.getState().markDoubled();
    }
    router.back();
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.ink, paddingTop: insets.top + 22, paddingHorizontal: 20, paddingBottom: insets.bottom + 24 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Chip label="PUB (DÉMO)" bg={colors.cream} />
        {left > 0 ? (
          <View style={{ width: 48, height: 48, borderRadius: 24, borderWidth: 4, borderColor: colors.cream, alignItems: 'center', justifyContent: 'center' }}>
            <Txt variant="display" size={20} color={colors.cream}>
              {left}
            </Txt>
          </View>
        ) : null}
      </View>
      {left > 0 ? (
        <>
          <View
            style={{
              marginTop: 110,
              height: 340,
              borderWidth: 4,
              borderStyle: 'dashed',
              borderColor: colors.cream,
              borderRadius: 24,
              alignItems: 'center',
              justifyContent: 'center',
              padding: 24,
            }}
          >
            <Txt variant="display" size={22} color={colors.cream} align="center">
              [ESPACE VIDÉO PUB]
            </Txt>
            <Txt size={16} color={colors.cream} align="center" style={{ marginTop: 12 }}>
              En production, une vraie vidéo de 5 à 30 secondes fournie par AdMob. Le joueur la choisit, il n’est jamais forcé.
            </Txt>
          </View>
          <Txt variant="marker" size={20} color={colors.lime} align="center" style={{ marginTop: 22 }}>
            encore quelques secondes et c’est doublé
          </Txt>
        </>
      ) : (
        <FadeIn style={{ marginTop: 80, alignItems: 'center' }}>
          <Bob>
            <Bulle color={colors.lime} mood="proud" acc="crown" size={170} />
          </Bob>
          <Pop style={{ marginTop: 18 }}>
            <Txt variant="display" size={40} color={colors.lime} align="center">
              GAINS{'\n'}DOUBLÉS !
            </Txt>
          </Pop>
          <Txt variant="bold" size={22} color={colors.cream} style={{ marginTop: 16 }}>
            +{coins} pièces en plus
          </Txt>
          <Button variant="cta" label="RÉCUPÉRER" bg={colors.lime} style={{ marginTop: 56, alignSelf: 'stretch' }} onPress={claim} />
        </FadeIn>
      )}
    </View>
  );
}
