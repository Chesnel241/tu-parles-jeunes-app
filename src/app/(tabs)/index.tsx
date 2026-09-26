import { router, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { View } from 'react-native';
import { Bulle } from '@/components/brand/Bulle';
import { IconChevron } from '@/components/brand/Icons';
import { Bob } from '@/components/brand/Motion';
import { Brutal, Button, Chip, CoinChip, Screen, StreakChip, Txt } from '@/components/ui';
import { LEXIK_TARGET } from '@/data/expressions';
import { cityColor } from '@/data/places';
import { startGame } from '@/features/game';
import { useAsync } from '@/hooks/useAsync';
import { timeUntilMidnight } from '@/logic/dates';
import { myRank } from '@/logic/leaderboard';
import { ordinal } from '@/logic/format';
import { backend } from '@/services/backend';
import { dailyDoneToday, displayedStreak, playerContext, useAppStore } from '@/store/app';
import { colors, onColor } from '@/theme';

/** Accueil : défi du jour, modes de jeu, raccourcis. */
export default function Home() {
  const s = useAppStore();
  const name = s.pseudo || 'toi';
  const chantier = s.customCity;
  const teamColor = chantier ? colors.orange : cityColor(s.city);
  const dailyDone = dailyDoneToday(s);

  const ranking = useAsync(() => backend.cityRanking(playerContext()), [s.city, s.weeklyPoints]);
  const city = useAsync(() => (chantier ? backend.cityStatus(playerContext()) : Promise.resolve(null)), [s.city, chantier]);
  useFocusEffect(
    useCallback(() => {
      ranking.reload();
      city.reload();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  const rank = ranking.data ? myRank(ranking.data) : null;
  const opened = Boolean(city.data?.opened);
  const rankText = chantier && !opened ? 'en chantier' : rank ? ordinal(rank) : '…';

  return (
    <Screen withTabBar>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <CoinChip coins={s.coins} />
        <StreakChip days={displayedStreak(s)} />
      </View>

      <Txt variant="display" size={31} style={{ marginTop: 18, lineHeight: 34 }} accessibilityRole="header">
        Salut {name},{'\n'}t’es chaud ?
      </Txt>
      <Chip label={`Team ${s.city} · ${rankText}`} bg={teamColor} color={onColor(teamColor)} style={{ marginTop: 10 }} />

      {chantier && !opened ? (
        <Button bg={colors.orange} style={{ marginTop: 14 }} onPress={() => router.push('/city/chantier')}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={{ flex: 1 }}>
              <Txt variant="label" size={11}>
                Ta ville en chantier
              </Txt>
              <Txt variant="bold" size={17}>
                {s.city} : {city.data?.players ?? '…'}/{city.data?.pioneer === false ? 30 : 10} joueurs, {city.data?.expressions ?? '…'}/
                {city.data?.pioneer === false ? 50 : 20} expressions
              </Txt>
            </View>
            <IconChevron />
          </View>
        </Button>
      ) : null}

      <Brutal bg={colors.lime} style={{ marginTop: 18 }} contentStyle={{ height: 196, padding: 18 }}>
        <Txt variant="label">Défi du jour</Txt>
        <Txt variant="display" size={24} style={{ marginTop: 6, lineHeight: 27 }}>
          5 expressions,{'\n'}les mêmes pour tous
        </Txt>
        <Txt variant="semi" size={15} style={{ marginTop: 6 }}>
          {dailyDone ? `Fait : ${s.dailyScore}/5. Nouveau défi demain.` : `Fin dans ${timeUntilMidnight()}`}
        </Txt>
        <View style={{ position: 'absolute', left: 14, bottom: 10 }}>
          <Button
            variant="cta"
            label={dailyDone ? 'À DEMAIN' : 'JOUER'}
            bg={colors.ink}
            color={colors.lime}
            offset={0}
            minHeight={48}
            contentStyle={{ paddingVertical: 8, paddingHorizontal: 20 }}
            disabled={dailyDone}
            onPress={() => startGame('daily')}
          />
        </View>
        <Bob style={{ position: 'absolute', right: 6, bottom: 4 }}>
          <Bulle color={colors.pink} mood="happy" acc={s.look} size={104} />
        </Bob>
      </Brutal>

      <View style={{ flexDirection: 'row', gap: 14, marginTop: 20 }}>
        <Tile title={'Partie\nrapide'} sub="5 questions, 10 s chacune" bg={colors.pink} onPress={() => startGame('quick')} />
        <Tile title="Duel" sub="Défie tes potes" bg={colors.blue} onPress={() => router.push('/duels')} />
      </View>
      <View style={{ flexDirection: 'row', gap: 14, marginTop: 14 }}>
        <Tile title={'Guerre\ndes villes'} sub={`Team ${s.city} · ${rankText}`} bg={colors.orange} onPress={() => router.push('/rankings')} />
        <Tile title={'Mon\nLexik'} sub={`${s.unlocked.length} / ${LEXIK_TARGET} débloquées`} bg={colors.white} onPress={() => router.push('/lexik')} />
      </View>

      <Button bg={colors.violet} style={{ marginTop: 18 }} contentStyle={{ paddingVertical: 12, paddingRight: 10 }} onPress={() => startGame('darons')}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View style={{ flex: 1, gap: 5 }}>
            <Chip label="NOUVEAU" bg={colors.ink} color={colors.lime} borderColor={colors.ink} size={11} />
            <Txt variant="display" size={21}>
              Jeunes vs Darons
            </Txt>
            <Txt variant="semi" size={14}>
              L’argot de tes parents, tu le captes ?
            </Txt>
          </View>
          <Bulle color={colors.lime} mood="happy" acc="shades" size={84} />
        </View>
      </Button>
    </Screen>
  );
}

function Tile({ title, sub, bg, onPress }: { title: string; sub: string; bg: string; onPress: () => void }) {
  return (
    <Button bg={bg} style={{ flex: 1 }} minHeight={118} contentStyle={{ justifyContent: 'space-between' }} onPress={onPress} accessibilityLabel={title.replace('\n', ' ')}>
      <Txt variant="bold" size={20} color={onColor(bg)} style={{ lineHeight: 24 }}>
        {title}
      </Txt>
      <Txt variant="semi" size={13} color={onColor(bg)}>
        {sub}
      </Txt>
    </Button>
  );
}
