import { router, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Bulle } from '@/components/brand/Bulle';
import { Brutal, Button, Chip, Header, ProgressBar, Screen, Txt } from '@/components/ui';
import type { ProposalStatus } from '@/data/types';
import { useAsync } from '@/hooks/useAsync';
import { backend } from '@/services/backend';
import { playerContext, useAppStore } from '@/store/app';
import { colors, stroke } from '@/theme';

const STATUS: Record<ProposalStatus, { label: string; bg: string; color: string }> = {
  vote: { label: 'En vote', bg: colors.blue, color: colors.white },
  ok: { label: 'Validée', bg: colors.lime, color: colors.ink },
  dup: { label: 'Refusée', bg: colors.violet, color: colors.ink },
  mod: { label: 'Modération', bg: colors.ink, color: colors.lime },
};

function Check({ done, label }: { done: boolean; label: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <View
        style={{
          width: 24,
          height: 24,
          borderWidth: stroke.medium,
          borderColor: colors.ink,
          borderRadius: 7,
          backgroundColor: done ? colors.ink : colors.white,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Txt variant="bold" size={13} color={colors.lime}>
          {done ? '✓' : ''}
        </Txt>
      </View>
      <Txt variant="bold" size={14}>
        {label}
      </Txt>
    </View>
  );
}

/** Mes propositions (statuts) et conditions pour devenir ambassadeur. */
export default function Proposals() {
  const city = useAppStore((s) => s.city);
  const { data, loading, reload } = useAsync(() => backend.myProposals(playerContext()), []);
  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );
  const list = data ?? [];
  const valid = list.filter((p) => p.status === 'ok').length;
  const voting = list.filter((p) => p.status === 'vote').length;
  const refused = list.filter((p) => p.status === 'dup' || p.status === 'mod').length;

  return (
    <Screen>
      <Header title="Mes propositions" />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16 }}>
        <Chip label={`${valid} validée${valid > 1 ? 's' : ''}`} bg={colors.lime} />
        <Chip label={`${voting} en vote`} bg={colors.blue} />
        <Chip label={`${refused} refusée${refused > 1 ? 's' : ''}`} bg={colors.violet} />
      </View>
      {loading && !data ? <ActivityIndicator color={colors.ink} style={{ marginTop: 20 }} /> : null}
      <View style={{ gap: 14, marginTop: 16 }}>
        {list.map((p) => {
          const st = STATUS[p.status];
          return (
            <Brutal key={p.id} contentStyle={{ paddingVertical: 14, paddingHorizontal: 16 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                <Txt variant="display" size={19} style={{ flex: 1, lineHeight: 22 }}>
                  {p.word}
                </Txt>
                <Chip label={st.label} bg={st.bg} color={st.color} size={12} />
              </View>
              <Txt size={14} style={{ marginTop: 4 }}>
                = {p.mean}
              </Txt>
              {p.status === 'vote' ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 }}>
                  <ProgressBar value={p.votes / 20} color={colors.blue} height={14} accessibilityLabel="Votes reçus" />
                  <Txt variant="bold" size={13}>
                    {p.votes}/20 votes
                  </Txt>
                </View>
              ) : null}
              {p.note || p.status === 'vote' ? (
                <Txt variant="semi" size={13} style={{ marginTop: 8 }}>
                  {p.note ?? 'Votée par les joueurs de ta ville. Il faut 20 votes et 70 % de « Vrai ».'}
                </Txt>
              ) : null}
            </Brutal>
          );
        })}
      </View>

      <Brutal bg={colors.pink} style={{ marginTop: 20 }} contentStyle={{ padding: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Bulle color={colors.cream} mood="proud" acc="cap" size={66} />
          <View style={{ flex: 1 }}>
            <Txt variant="label" size={11}>
              Prochain rôle
            </Txt>
            <Txt variant="display" size={19} style={{ lineHeight: 21 }}>
              Ambassadeur de {city}
            </Txt>
          </View>
        </View>
        <Txt variant="semi" size={14} style={{ marginTop: 10 }}>
          Ton vote compte double et tu aides à trier les propositions de ta ville.
        </Txt>
        <View style={{ gap: 6, marginTop: 10 }}>
          <Check done={valid >= 5} label={`5 expressions validées (${Math.min(valid, 5)}/5)`} />
          <Check done={false} label="30 jours de jeu" />
          <Check done label="Aucun signalement" />
        </View>
      </Brutal>
      <Button variant="cta" label="+ PROPOSER UNE EXPRESSION" bg={colors.lime} style={{ marginTop: 18 }} onPress={() => router.push('/propose')} />
    </Screen>
  );
}
