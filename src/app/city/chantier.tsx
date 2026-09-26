import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect } from 'react';
import { View } from 'react-native';
import { Bulle } from '@/components/brand/Bulle';
import { Brutal, Button, Chip, Header, ProgressBar, Screen, Txt } from '@/components/ui';
import { startGame } from '@/features/game';
import { useAsync } from '@/hooks/useAsync';
import { quotaFor } from '@/logic/cities';
import { backend } from '@/services/backend';
import { playerContext, useAppStore } from '@/store/app';
import { colors } from '@/theme';

/** Ville en chantier : jauges, fondateurs, actions pour l'ouvrir. */
export default function Chantier() {
  const { from } = useLocalSearchParams<{ from?: string }>();
  const fromOnboarding = from === 'onboarding';
  const city = useAppStore((s) => s.city);
  const country = useAppStore((s) => s.country);
  const seen = useAppStore((s) => s.cityOpenedSeen);
  const { data, reload } = useAsync(() => backend.cityStatus(playerContext()), [city]);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  useEffect(() => {
    if (data?.opened && !seen) router.replace('/city/opened');
  }, [data?.opened, seen]);

  const q = quotaFor(data?.pioneer ?? true);
  const players = data?.players ?? 1;
  const expressions = data?.expressions ?? 0;
  const founders = data?.founders ?? ['Toi'];

  return (
    <Screen bg={colors.orange}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Header onBack={() => (fromOnboarding ? router.back() : router.canGoBack() ? router.back() : router.replace('/'))} />
        <Chip label="EN CHANTIER" bg={colors.ink} color={colors.lime} borderColor={colors.ink} />
      </View>
      <Txt variant="display" size={38} style={{ marginTop: 18 }} accessibilityRole="header">
        {city}
      </Txt>
      <Chip label={`Team ${country} · Coupe des pays`} style={{ marginTop: 10 }} />

      <Brutal style={{ marginTop: 18 }} contentStyle={{ padding: 16 }}>
        <Txt variant="bold" size={18}>
          Tu joues déjà !
        </Txt>
        <Txt size={15} style={{ marginTop: 6 }}>
          Tes points vont à Team {country}. Dès que {city} atteint son quota, elle entre dans la Guerre des villes.
        </Txt>
        {data?.pioneer !== false ? (
          <Txt variant="semi" size={14} style={{ marginTop: 8 }}>
            Première ville de ton pays : quota « pionnier », plus bas que d’habitude. Tes propositions sont votées par un jury élargi (pays voisins et
            ambassadeurs) pour ne pas rester bloquées.
          </Txt>
        ) : null}
      </Brutal>

      <Brutal style={{ marginTop: 16 }} contentStyle={{ padding: 16, gap: 8 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Txt variant="bold">Joueurs</Txt>
          <Txt variant="bold">
            {players}/{q.players}
          </Txt>
        </View>
        <View style={{ flexDirection: 'row' }}>
          <ProgressBar value={players / q.players} color={colors.lime} accessibilityLabel="Joueurs" />
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
          <Txt variant="bold">Expressions validées</Txt>
          <Txt variant="bold">
            {expressions}/{q.expressions}
          </Txt>
        </View>
        <View style={{ flexDirection: 'row' }}>
          <ProgressBar value={expressions / q.expressions} color={colors.pink} accessibilityLabel="Expressions validées" />
        </View>
      </Brutal>

      <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
        <Button label="Inviter des potes" bg={colors.lime} align="center" style={{ flex: 1 }} onPress={() => router.push({ pathname: '/invite', params: { context: 'city' } })} />
        <Button label="Proposer une expression" bg={colors.pink} align="center" style={{ flex: 1 }} onPress={() => router.push('/propose')} />
      </View>

      <Txt variant="label" style={{ marginTop: 20 }}>
        Les fondateurs
      </Txt>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
        {founders.slice(0, 4).map((f, i) => (
          <Chip key={`${f}-${i}`} label={i === 0 ? 'Toi' : f} bg={i === 0 ? colors.lime : colors.white} />
        ))}
        {players > 4 ? <Chip label={`+ ${players - 4} autres`} bg={colors.cream} /> : null}
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 16 }}>
        <Bulle color={colors.cream} mood="happy" acc="bob" size={80} />
        <Txt variant="marker" size={20} style={{ flex: 1 }}>
          badge Fondateur à vie le jour de l’ouverture
        </Txt>
      </View>

      <Button
        variant="cta"
        bg={colors.ink}
        color={colors.lime}
        style={{ marginTop: 18 }}
        label={fromOnboarding ? 'CONTINUER' : `JOUER POUR TEAM ${country.toUpperCase()}`}
        onPress={() => (fromOnboarding ? router.replace('/onboarding/universe') : startGame('quick'))}
      />
    </Screen>
  );
}
