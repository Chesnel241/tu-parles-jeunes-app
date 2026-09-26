import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Button, ChipButton, ProgressBar, Screen, Txt, useToast } from '@/components/ui';
import { LEXIK_TARGET } from '@/data/expressions';
import type { Region } from '@/data/types';
import { tapLight } from '@/services/haptics';
import { useAppStore } from '@/store/app';
import { useContentStore } from '@/store/content';
import { colors, cycle, onColor, stickerCycle, stickerTilt, stroke } from '@/theme';

type Filter = 'tout' | 'eu' | 'af' | 'darons';
const FILTERS: { id: Filter; label: string }[] = [
  { id: 'tout', label: 'Tout' },
  { id: 'eu', label: 'Europe' },
  { id: 'af', label: 'Afrique' },
  { id: 'darons', label: 'Darons' },
];

function matches(filter: Filter, region: Region): boolean {
  if (filter === 'tout') return true;
  if (filter === 'eu') return region === 'eu' || region === 'web';
  return region === filter;
}

/** Mon Lexik : l'album de stickers des expressions trouvées. */
export default function Lexik() {
  const toast = useToast();
  const unlocked = useAppStore((s) => s.unlocked);
  const expressions = useContentStore((s) => s.expressions);
  const [filter, setFilter] = useState<Filter>('tout');
  const shown = expressions.filter((e) => matches(filter, e.region));
  const count = unlocked.filter((key) => expressions.some((expression) => expression.key === key)).length;

  return (
    <Screen withTabBar>
      <Txt variant="display" size={31} style={{ marginTop: 4 }} accessibilityRole="header">
        Mon Lexik
      </Txt>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10 }}>
        <ProgressBar value={count / LEXIK_TARGET} color={colors.pink} accessibilityLabel="Expressions débloquées" />
        <Txt variant="bold">
          {count}/{LEXIK_TARGET}
        </Txt>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 }}>
        {FILTERS.map((f) => (
          <ChipButton
            key={f.id}
            label={f.label}
            bg={filter === f.id ? colors.ink : colors.white}
            color={filter === f.id ? colors.cream : colors.ink}
            selected={filter === f.id}
            compact
            size={14}
            onPress={() => setFilter(f.id)}
          />
        ))}
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 16, marginTop: 18 }}>
        {shown.map((e, i) => {
          const un = unlocked.includes(e.key);
          const bg = cycle(stickerCycle, i);
          const size = e.word.length > 11 ? 12 : e.word.length > 7 ? 14 : 17;
          return (
            <View key={e.key} style={{ width: '30.5%', transform: [{ rotate: `${cycle(stickerTilt, i)}deg` }] }}>
              {un ? <View style={{ position: 'absolute', top: 4, left: 4, right: -4, bottom: -4, borderRadius: 16, backgroundColor: colors.ink }} /> : null}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={un ? `Voir ${e.word}` : 'Expression à débloquer'}
                onPress={() => {
                  tapLight();
                  if (un) router.push({ pathname: '/expression/[key]', params: { key: e.key } });
                  else toast.show('Joue pour débloquer celle-là !');
                }}
                style={{
                  height: 88,
                  borderRadius: 16,
                  borderWidth: stroke.medium,
                  borderColor: colors.ink,
                  borderStyle: un ? 'solid' : 'dashed',
                  backgroundColor: un ? bg : colors.paper,
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 6,
                  opacity: un ? 1 : 0.55,
                }}
              >
                <Txt variant="display" size={un ? size : 24} align="center" color={un ? onColor(bg) : colors.inkSoft} style={{ lineHeight: (un ? size : 24) * 1.15 }}>
                  {un ? e.word : '?'}
                </Txt>
              </Pressable>
            </View>
          );
        })}
      </View>

      <Txt variant="marker" size={20} color={colors.pink} align="center" style={{ marginTop: 18 }}>
        encore {Math.max(0, LEXIK_TARGET - count)} à débloquer
      </Txt>
      <Button variant="cta" label="+ PROPOSER UNE EXPRESSION" bg={colors.lime} style={{ marginTop: 14 }} onPress={() => router.push('/propose')} />
      <Button label="Mes propositions" align="center" style={{ marginTop: 12 }} onPress={() => router.push('/proposals')} />
    </Screen>
  );
}
