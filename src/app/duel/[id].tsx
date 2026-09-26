import { router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { Bulle } from '@/components/brand/Bulle';
import { Bob, Pop } from '@/components/brand/Motion';
import { Wax } from '@/components/brand/Wax';
import { Button, Screen, Txt } from '@/components/ui';
import { startGame } from '@/features/game';
import { useAsync } from '@/hooks/useAsync';
import { backend, initializeBackend } from '@/services/backend';
import { useAppStore } from '@/store/app';
import { colors } from '@/theme';

/** Ouverture d'un lien de duel (tuparlesjeune://duel/ID ou https://…/duel/ID). */
export default function DuelLink() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const onboarded = useAppStore((s) => s.onboarded);
  const setPendingDuelId = useAppStore((s) => s.setPendingDuelId);
  const { data: duel, loading, error } = useAsync(
    () => initializeBackend().then(() => backend.getDuel(String(id))),
    [id],
  );

  return (
    <Screen bg={colors.blue} background={<Wax variant="ink" opacity={0.12} />} contentStyle={{ alignItems: 'center' }}>
      {loading ? <ActivityIndicator color={colors.white} style={{ marginTop: 80 }} /> : null}
      {!loading && (error || !duel) ? (
        <Txt variant="bold" color={colors.white} align="center" style={{ marginTop: 80 }}>
          Ce défi n’existe plus ou a expiré.
        </Txt>
      ) : null}
      {duel ? (
        <>
          <Pop style={{ marginTop: 40 }}>
            <Txt variant="display" size={38} color={colors.white} align="center">
              {duel.creator.toUpperCase()}
              {'\n'}TE DÉFIE !
            </Txt>
          </Pop>
          <Bob style={{ marginTop: 20 }}>
            <Bulle color={colors.lime} mood="proud" acc="shades" size={170} />
          </Bob>
          <Txt variant="marker" size={22} color={colors.lime} align="center" style={{ marginTop: 16 }}>
            5 expressions, 10 secondes chacune
          </Txt>
          <View style={{ alignSelf: 'stretch', marginTop: 30 }}>
            {onboarded ? (
              <Button
                variant="cta"
                label="RELEVER LE DÉFI"
                bg={colors.lime}
                onPress={() =>
                  startGame('duel', {
                    questionIds: duel.questionIds,
                    duel: { id: backend.isDemo ? null : duel.id, opponent: duel.creator, theirScore: duel.creatorScore },
                  })
                }
              />
            ) : (
              <Button
                variant="cta"
                label="CRÉER MON PROFIL D'ABORD"
                bg={colors.lime}
                onPress={() => {
                  setPendingDuelId(String(id));
                  router.replace('/onboarding');
                }}
              />
            )}
          </View>
        </>
      ) : null}
    </Screen>
  );
}
