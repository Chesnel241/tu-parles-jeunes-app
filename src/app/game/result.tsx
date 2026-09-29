import { Redirect, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Bulle } from '@/components/brand/Bulle';
import { Bob, Pop } from '@/components/brand/Motion';
import { Brutal, Button, Chip, Screen, Txt, useToast } from '@/components/ui';
import { QUESTIONS_PER_GAME } from '@/data/questions';
import { startGame } from '@/features/game';
import { submitGame } from '@/features/submission';
import { endLook, MODE_LABELS, rewardFor } from '@/logic/game';
import { plural } from '@/logic/format';
import { ads } from '@/services/ads';
import { backend } from '@/services/backend';
import { useAppStore } from '@/store/app';
import { scoreOf, useGameStore } from '@/store/game';
import { colors } from '@/theme';

/** Fin de partie : score, récompenses, pub récompensée, partage, défi. */
export default function Result() {
  const g = useGameStore();
  const app = useAppStore();
  const toast = useToast();
  const [doubling, setDoubling] = useState(false);
  const score = scoreOf(g);
  const { coins, cityPoints } = rewardFor(score);
  const look = endLook(score);

  // Enregistre la partie une seule fois (téléphone + serveur), puis éventuel interstitiel plafonné.
  useEffect(() => {
    const s = useGameStore.getState();
    if (s.committed || s.questions.length === 0) return;
    s.markCommitted();
    useAppStore.getState().recordGame({ mode: s.mode, score: scoreOf(s), unlocked: s.newUnlocks });
    submitGame({ mode: s.mode, questionIds: s.questions.map((q) => q.id), answers: s.answers, duelId: s.duelId ?? undefined }).then((err) => {
      if (err && !backend.isDemo) toast.show(err);
    });
    const a = useAppStore.getState();
    if (!a.noAds && s.mode !== 'daily') {
      setTimeout(() => {
        ads.maybeShowInterstitial(a.gamesSinceInterstitial).then((shown) => shown && useAppStore.getState().resetInterstitialCounter());
      }, 900);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (g.questions.length === 0) return <Redirect href="/" />;

  const modeLabel = g.mode === 'duel' && g.duelOpponent ? `Duel contre ${g.duelOpponent}` : MODE_LABELS[g.mode];
  let sub = score >= 3 ? 'ta ville te remercie' : 'rejoue, ça rentre vite';
  if (g.mode === 'daily') sub = 'défi du jour bouclé, reviens demain';
  if (g.mode === 'darons') sub = score >= 3 ? 'tes darons n’ont qu’à bien se tenir' : 'demande à tes darons, ils vont rire';
  if (g.mode === 'duel' && g.duelTheirScore != null) {
    const t = g.duelTheirScore;
    sub = `duel contre ${g.duelOpponent} : ${score} à ${t}, ${score > t ? 'tu gagnes !' : score === t ? 'égalité' : 'il ou elle gagne'}`;
  } else if (g.mode === 'duel') {
    sub = 'envoie le défi, à ton pote de jouer';
  }
  const newCount = g.newUnlocks.length;
  const acc = look.acc === 'user' ? app.look : look.acc;
  const canDouble = !g.doubled && coins > 0;
  const needsInvite = g.mode === 'duel' && !g.duelId;

  const double = async () => {
    if (app.noAds) {
      app.addCoins(coins);
      g.markDoubled();
      toast.show(`+${coins} pièces, cadeau !`);
      return;
    }
    setDoubling(true);
    const res = await ads.showRewarded();
    setDoubling(false);
    if (res === 'earned') {
      useAppStore.getState().addCoins(coins);
      useGameStore.getState().markDoubled();
      toast.show(`Gains doublés : +${coins} pièces`);
    } else if (res === 'closed') {
      toast.show('Pub pas terminée : pas de bonus cette fois.');
    } else if (backend.isDemo || __DEV__) {
      router.push('/game/ad');
    } else {
      toast.show('Pas de pub dispo pour le moment, réessaie plus tard.');
    }
  };

  return (
    <Screen bg={look.bg} contentStyle={{ alignItems: 'stretch' }}>
      <Txt variant="label" align="center" style={{ marginTop: 6 }}>
        {modeLabel}
      </Txt>
      <Pop style={{ alignSelf: 'center', marginTop: 12 }}>
        <Txt variant="display" size={36} align="center" accessibilityLiveRegion="polite">
          {look.title}
        </Txt>
      </Pop>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 16 }}>
        <Brutal tilt={3} contentStyle={{ paddingVertical: 10, paddingHorizontal: 18 }}>
          <Txt variant="display" size={66} accessibilityLabel={`Score ${score} sur ${QUESTIONS_PER_GAME}`}>
            {score}/{QUESTIONS_PER_GAME}
          </Txt>
        </Brutal>
        <Bob>
          <Bulle color={look.bulle} mood={look.mood} acc={acc} size={140} />
        </Bob>
      </View>
      <Txt variant="marker" size={21} align="center" style={{ marginTop: 12 }}>
        {sub}
      </Txt>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginTop: 14 }}>
        <Chip label={`+${coins} pièces`} size={14} tilt={-2} />
        <Chip label={`+${cityPoints} pts Team ${app.customCity ? app.country : app.city}`} bg={colors.orange} size={14} tilt={1.5} />
        <Chip label={plural(newCount, 'nouvelle expression', 'nouvelles expressions')} bg={colors.pink} size={14} tilt={-1} />
      </View>

      <View style={{ gap: 12, marginTop: 20 }}>
        {needsInvite ? (
          <Button variant="cta" label="ENVOYER LE DÉFI" bg={colors.blue} color={colors.white} onPress={() => router.push({ pathname: '/invite', params: { context: 'duel' } })} />
        ) : null}
        {canDouble ? (
          <Button bg={colors.pink} onPress={double} disabled={doubling}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View>
                <Txt variant="bold" size={18}>
                  {doubling ? 'Chargement de la pub…' : 'Doubler mes gains'}
                </Txt>
                <Txt variant="semi" size={13}>
                  {app.noAds ? 'Abonnement sans pub actif : c’est cadeau' : 'Une courte pub, et c’est doublé'}
                </Txt>
              </View>
              <Txt variant="display" size={22}>
                x2
              </Txt>
            </View>
          </Button>
        ) : g.doubled ? (
          <Brutal contentStyle={{ padding: 12 }}>
            <Txt variant="bold" align="center">
              Gains doublés, bien joué !
            </Txt>
          </Brutal>
        ) : null}
        <Button label="Partager ma story" bg={colors.blue} onPress={() => router.push('/game/share')} />
        {!needsInvite ? (
          <Button label="Défier un pote sur ces questions" bg={colors.orange} onPress={() => router.push({ pathname: '/invite', params: { context: 'duel' } })} />
        ) : null}
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Button label="Rejouer" align="center" style={{ flex: 1 }} onPress={() => (g.mode === 'daily' ? startGame('quick') : startGame(g.mode === 'duel' ? 'quick' : g.mode))} />
          <Button label="Accueil" align="center" bg={colors.ink} color={colors.lime} style={{ flex: 1 }} onPress={() => router.replace('/')} />
        </View>
      </View>
    </Screen>
  );
}
