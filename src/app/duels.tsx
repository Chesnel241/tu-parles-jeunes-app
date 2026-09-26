import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Bulle } from '@/components/brand/Bulle';
import { Brutal, Button, Chip, Header, Screen, Txt } from '@/components/ui';
import { startGame } from '@/features/game';
import { useAsync } from '@/hooks/useAsync';
import { backend, type DuelSummary } from '@/services/backend';
import { playerContext, useAppStore } from '@/store/app';
import { colors } from '@/theme';

function playDuel(d: DuelSummary) {
  backend
    .getDuel(d.id)
    .then((duel) => startGame('duel', { questionIds: duel?.questionIds, duel: { id: backend.isDemo ? null : d.id, opponent: d.opponent, theirScore: d.theirScore } }))
    .catch(() => startGame('duel', { duel: { id: null, opponent: d.opponent, theirScore: d.theirScore } }));
}

/** Duels : dernier résultat, duels en cours, terminés. */
export default function Duels() {
  const look = useAppStore((s) => s.look);
  const { data, loading, error, reload } = useAsync(() => backend.listDuels(playerContext()), []);
  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  const duels = data ?? [];
  const last = duels.find((d) => d.status === 'lost') ?? duels.find((d) => d.status === 'won' || d.status === 'draw');
  const ongoing = duels.filter((d) => d.status === 'my_turn' || d.status === 'their_turn');
  const done = duels.filter((d) => d !== last && (d.status === 'won' || d.status === 'lost' || d.status === 'draw'));

  return (
    <Screen bg={colors.blue}>
      <Header title="Duels" color={colors.white} titleSize={31} />
      {loading && !data ? <ActivityIndicator color={colors.white} style={{ marginTop: 30 }} /> : null}
      {error ? (
        <Txt variant="bold" color={colors.white} style={{ marginTop: 16 }}>
          Impossible de charger tes duels. Vérifie ta connexion.
        </Txt>
      ) : null}

      {last ? (
        <Brutal bg={colors.cream} style={{ marginTop: 16 }} contentStyle={{ padding: 16, alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', alignSelf: 'stretch' }}>
            <View style={{ alignItems: 'center' }}>
              <Bulle color={colors.lime} mood={last.status === 'lost' ? 'seum' : 'proud'} acc={look} size={92} />
              <Txt variant="bold">Toi</Txt>
            </View>
            <Txt variant="display" size={40}>
              {last.myScore ?? 0}-{last.theirScore ?? 0}
            </Txt>
            <View style={{ alignItems: 'center' }}>
              <Bulle color={colors.orange} mood={last.status === 'lost' ? 'proud' : 'seum'} acc="shades" size={92} />
              <Txt variant="bold">{last.opponent}</Txt>
            </View>
          </View>
          <Txt variant="marker" size={21} color={colors.pink} style={{ marginTop: 6 }}>
            {last.status === 'lost' ? 'il t’a eu… revanche ?' : 'bien joué, on remet ça ?'}
          </Txt>
          <Button variant="cta" label="PRENDRE MA REVANCHE" bg={colors.pink} style={{ marginTop: 12, alignSelf: 'stretch' }} onPress={() => startGame('duel', { duel: { id: null, opponent: last.opponent } })} />
        </Brutal>
      ) : null}

      {ongoing.length ? (
        <Txt variant="label" color={colors.white} style={{ marginTop: 22 }}>
          En cours
        </Txt>
      ) : null}
      <View style={{ gap: 12, marginTop: 10 }}>
        {ongoing.map((d) =>
          d.status === 'my_turn' ? (
            <Button key={d.id} onPress={() => playDuel(d)} accessibilityLabel={`${d.opponent}, à toi de jouer`}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Txt variant="bold" size={19}>
                  {d.opponent}
                </Txt>
                <Chip label="À toi de jouer" bg={colors.lime} />
              </View>
            </Button>
          ) : (
            <Brutal key={d.id} offset={5} radius={18} contentStyle={{ paddingVertical: 14, paddingHorizontal: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Txt variant="bold" size={19}>
                {d.opponent}
              </Txt>
              <Chip label="Il ou elle joue…" bg={colors.cream} />
            </Brutal>
          ),
        )}
      </View>

      {done.length ? (
        <>
          <Txt variant="label" color={colors.white} style={{ marginTop: 22 }}>
            Terminés
          </Txt>
          <View style={{ gap: 8, marginTop: 10 }}>
            {done.map((d) => (
              <View key={d.id} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Txt variant="semi" color={colors.white}>
                  {d.status === 'won' ? 'Gagné' : d.status === 'lost' ? 'Perdu' : 'Égalité'} contre {d.opponent}
                </Txt>
                <Txt variant="bold" color={colors.white}>
                  {d.myScore}-{d.theirScore}
                </Txt>
              </View>
            ))}
          </View>
        </>
      ) : null}

      {!loading && duels.length === 0 && !error ? (
        <Txt variant="marker" size={21} color={colors.white} style={{ marginTop: 22 }}>
          aucun duel pour l’instant : lance le premier !
        </Txt>
      ) : null}

      <Button variant="cta" label="+ DÉFIER UN POTE" bg={colors.lime} style={{ marginTop: 20 }} onPress={() => startGame('duel', { duel: { id: null, opponent: 'ton pote' } })} />
      <Txt variant="semi" size={13} color={colors.white} style={{ marginTop: 10 }}>
        Tu joues d’abord 5 questions, puis tu envoies le même défi à ton pote. Il a 24 h.
      </Txt>
    </Screen>
  );
}
