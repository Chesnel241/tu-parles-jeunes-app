import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Brutal, Button, Chip, ChipButton, Screen, Txt } from '@/components/ui';
import { cityColor } from '@/data/places';
import { startGame } from '@/features/game';
import { useAsync } from '@/hooks/useAsync';
import { isoWeek } from '@/logic/dates';
import { chaseMessage, toDisplayRows } from '@/logic/leaderboard';
import { ordinal } from '@/logic/format';
import { backend } from '@/services/backend';
import { playerContext, useAppStore } from '@/store/app';
import { colors, stroke } from '@/theme';

type Tab = 'villes' | 'pays' | 'amis';

/** Guerre des villes, Coupe des pays et classement entre potes (semaine en cours). */
export default function Rankings() {
  const [tab, setTab] = useState<Tab>('villes');
  const s = useAppStore();
  const ctx = playerContext(s);
  const { data, loading, error, reload } = useAsync(
    () => (tab === 'villes' ? backend.cityRanking(ctx) : tab === 'pays' ? backend.countryRanking(ctx) : backend.friendsRanking(ctx)),
    [tab, s.city, s.heart, s.weeklyPoints, s.customCity],
  );
  const city = useAsync(() => (s.customCity ? backend.cityStatus(ctx) : Promise.resolve(null)), [s.city, s.customCity]);
  useFocusEffect(
    useCallback(() => {
      reload();
      city.reload();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  const rows = data ? toDisplayRows(data, tab === 'pays' ? 8 : 10) : [];
  const chantier = s.customCity && !city.data?.opened;
  let head = '';
  let body = '';
  if (tab === 'villes' && chantier) {
    const needP = Math.max(0, (city.data?.pioneer === false ? 30 : 10) - (city.data?.players ?? 0));
    const needE = Math.max(0, (city.data?.pioneer === false ? 50 : 20) - (city.data?.expressions ?? 0));
    head = `${s.city} est en chantier.`;
    body = `Tes points comptent pour Team ${s.country} (onglet Pays). Encore ${needP} joueurs et ${needE} expressions pour ouvrir ta ville.`;
  } else if (data) {
    const msg = chaseMessage(data);
    if (tab === 'pays') {
      const idx = data.slice().sort((a, b) => b.pts - a.pts).findIndex((r) => r.me);
      head = `Team ${s.country} est ${ordinal(idx + 1)} de la Coupe des pays.`;
      body = s.heart && s.heart !== s.country ? `Team ${s.heart}, ton pays de cœur, profite aussi de tes points.` : 'Chaque joueur fait monter son pays, même quand sa ville n’est pas encore ouverte.';
    } else if (tab === 'amis') {
      head = msg ? msg.head.replace('Toi est', 'T’es') : '';
      body = msg ? msg.body.replace('pour doubler', 'pour passer devant') : 'Lance un duel pour remplir ce classement.';
    } else if (msg) {
      head = `Team ${msg.head}`;
      body = msg.body;
    }
  }

  return (
    <Screen bg={colors.orange} withTabBar>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Txt variant="display" size={31} style={{ marginTop: 4, lineHeight: 33 }} accessibilityRole="header">
          Guerre{'\n'}des villes
        </Txt>
        {backend.isDemo ? <Chip label="Démo" bg={colors.cream} /> : null}
      </View>
      <Txt variant="label" style={{ marginTop: 8 }}>
        Semaine {isoWeek()} · fin dimanche
      </Txt>
      <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
        {(['villes', 'pays', 'amis'] as const).map((t) => (
          <ChipButton
            key={t}
            label={t === 'villes' ? 'Villes' : t === 'pays' ? 'Pays' : 'Amis'}
            bg={tab === t ? colors.ink : colors.white}
            color={tab === t ? colors.cream : colors.ink}
            selected={tab === t}
            onPress={() => setTab(t)}
          />
        ))}
      </View>

      <Brutal style={{ marginTop: 16 }} contentStyle={{ paddingVertical: 10, paddingHorizontal: 14, overflow: 'visible' }}>
        {loading && !data ? <ActivityIndicator color={colors.ink} style={{ marginVertical: 20 }} /> : null}
        {error ? (
          <Txt variant="semi" style={{ marginVertical: 12 }}>
            Classement indisponible. Vérifie ta connexion.
          </Txt>
        ) : null}
        {rows.map((r) =>
          r.separator ? (
            <Txt key={r.key} variant="bold" style={{ paddingVertical: 2, opacity: 0.6 }}>
              …
            </Txt>
          ) : (
            <View
              key={r.key}
              accessibilityLabel={`${r.rank}, ${r.name}, ${r.pts} points`}
              style={[
                { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 7 },
                r.me || r.heart
                  ? {
                      backgroundColor: r.me ? colors.lime : colors.pink,
                      borderWidth: stroke.medium,
                      borderColor: colors.ink,
                      borderRadius: 14,
                      marginHorizontal: -8,
                      marginVertical: 2,
                      paddingHorizontal: 8,
                      paddingVertical: 6,
                    }
                  : null,
              ]}
            >
              <Txt variant="display" size={17} style={{ width: 28 }}>
                {r.rank}
              </Txt>
              <Txt variant="bold" size={15} style={{ width: 100 }} numberOfLines={1}>
                {r.heart ? `${r.name} (cœur)` : r.name}
              </Txt>
              <View style={{ flex: 1, height: 16, borderWidth: stroke.medium, borderColor: colors.ink, borderRadius: 8, overflow: 'hidden', backgroundColor: colors.white }}>
                <View
                  style={{
                    width: `${Math.round(r.share * 100)}%`,
                    height: '100%',
                    backgroundColor: tab === 'villes' ? r.color ?? cityColor(r.name) : tab === 'pays' ? (r.me ? colors.orange : r.heart ? colors.violet : colors.blue) : r.me ? colors.pink : colors.blue,
                  }}
                />
              </View>
              <Txt variant="bold" size={13} style={{ width: 64, textAlign: 'right' }}>
                {r.ptsText}
              </Txt>
            </View>
          ),
        )}
      </Brutal>

      {head ? (
        <View style={{ marginTop: 16, backgroundColor: colors.ink, borderRadius: 20, padding: 14, paddingHorizontal: 16 }}>
          <Txt size={16} color={colors.cream}>
            <Txt variant="bold" size={16} color={colors.lime}>
              {head}
            </Txt>{' '}
            {body}
          </Txt>
        </View>
      ) : null}
      {tab === 'amis' ? (
        <Button label="Défier un pote" align="center" bg={colors.blue} style={{ marginTop: 16 }} onPress={() => router.push('/duels')} />
      ) : null}
      <Button
        variant="cta"
        label={`JOUER POUR ${(tab === 'pays' || chantier ? s.country : s.city).toUpperCase()}`}
        bg={colors.lime}
        style={{ marginTop: 16 }}
        onPress={() => startGame('quick')}
      />
    </Screen>
  );
}
