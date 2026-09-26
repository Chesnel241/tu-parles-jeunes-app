import { Redirect, router } from 'expo-router';
import { useEffect } from 'react';
import { Alert, AppState, View } from 'react-native';
import { Bulle } from '@/components/brand/Bulle';
import { Coin, IconClose } from '@/components/brand/Icons';
import { Bob, FadeIn, Pop } from '@/components/brand/Motion';
import { Wax } from '@/components/brand/Wax';
import { Brutal, Button, Chip, ChipButton, IconButton, ProgressBar, Screen, Txt } from '@/components/ui';
import { COINS_PER_GOOD_ANSWER, QUESTIONS_PER_GAME } from '@/data/questions';
import { feedbackTitle, MODE_COLORS, MODE_LABELS } from '@/logic/game';
import { failure, success } from '@/services/haptics';
import { useAppStore } from '@/store/app';
import { useContentStore } from '@/store/content';
import { useGameStore } from '@/store/game';
import { colors, onColor } from '@/theme';

const LETTERS = ['A', 'B', 'C', 'D'] as const;
const LETTER_COLORS = [colors.lime, colors.pink, colors.blue, colors.orange] as const;

/** Partie en cours : question avec chrono, puis écran de réponse. */
export default function Play() {
  const g = useGameStore();
  const look = useAppStore((s) => s.look);
  const q = g.questions[g.index];
  const expression = useContentStore((s) => s.expressions.find((item) => item.key === q?.lex));

  // Chrono : 1 seconde, en pause si l'app passe en arrière-plan.
  useEffect(() => {
    if (g.phase !== 'question') return undefined;
    const id = setInterval(() => {
      if (AppState.currentState === 'active') useGameStore.getState().tick(useAppStore.getState().unlocked);
    }, 1000);
    return () => clearInterval(id);
  }, [g.phase, g.index]);

  // Retour haptique à chaque réponse.
  useEffect(() => {
    if (g.phase !== 'feedback' || !q) return;
    if (g.answers[g.index] === q.good) success();
    else failure();
  }, [g.phase, g.index, g.answers, q]);

  useEffect(() => {
    if (g.phase === 'done') router.replace('/game/result');
  }, [g.phase]);

  if (!q) return <Redirect href="/" />;
  const modeLabel = g.mode === 'duel' && g.duelOpponent ? `Duel contre ${g.duelOpponent}` : MODE_LABELS[g.mode];
  const modeColor = MODE_COLORS[g.mode];

  const quit = () =>
    Alert.alert('Quitter la partie ?', 'Tes réponses ne seront pas comptées.', [
      { text: 'Rester', style: 'cancel' },
      { text: 'Quitter', style: 'destructive', onPress: () => router.replace('/') },
    ]);

  if (g.phase === 'feedback' || g.phase === 'done') {
    const choice = g.answers[g.index] ?? -1;
    const good = choice === q.good;
    const kind = good ? 'good' : choice === -1 ? 'timeout' : 'wrong';
    const [t1, t2] = feedbackTitle(kind);
    const isNew = good && g.newUnlocks.includes(q.lex);
    const last = g.index + 1 >= g.questions.length;
    return (
      <Screen bg={good ? colors.lime : colors.violet} background={<Wax variant="ink" opacity={0.13} />} contentStyle={{ alignItems: 'stretch' }}>
        <Pop style={{ marginTop: 26, alignSelf: 'center' }}>
          <Txt variant="display" size={46} align="center" style={{ lineHeight: 48 }} accessibilityLiveRegion="assertive">
            {t1}
            {'\n'}
            {t2}
          </Txt>
        </Pop>
        <Bob style={{ alignItems: 'center', marginTop: 16 }}>
          <Bulle color={good ? colors.pink : colors.cream} mood={good ? 'proud' : 'seum'} acc={good ? 'crown' : 'none'} size={170} />
        </Bob>
        <FadeIn>
          <Brutal style={{ marginTop: 18 }} contentStyle={{ padding: 16, paddingHorizontal: 18 }}>
            {!good ? (
              <>
                <Txt variant="label" color={colors.blue}>
                  La bonne réponse
                </Txt>
                <Txt variant="bold" size={19} style={{ marginTop: 4, marginBottom: 12 }}>
                  {q.answers[q.good]}
                </Txt>
              </>
            ) : null}
            <Txt variant="display" size={22}>
              {expression?.word}
            </Txt>
            <Txt size={16} style={{ marginTop: 6 }}>
              {expression?.def}
            </Txt>
            <Txt variant="marker" size={18} color={colors.pink} style={{ marginTop: 8 }}>
              {expression?.ex}
            </Txt>
            <Txt variant="bold" size={15} color={colors.blue} style={{ marginTop: 10 }}>
              {q.pct} % des joueurs ont trouvé
            </Txt>
          </Brutal>
        </FadeIn>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10, marginTop: 16 }}>
          {good ? (
            <Chip tilt={-2}>
              <Coin size={18} />
              <Txt variant="bold" size={15}>
                +{COINS_PER_GOOD_ANSWER} pièces
              </Txt>
            </Chip>
          ) : null}
          {isNew ? <Chip label="Nouvelle expression dans ton Lexik" bg={colors.pink} size={15} tilt={2} /> : null}
        </View>
        <Button variant="cta" label={last ? 'VOIR MON SCORE' : 'SUIVANT'} bg={colors.ink} color={colors.lime} style={{ marginTop: 20 }} onPress={() => g.next()} />
      </Screen>
    );
  }

  return (
    <Screen bottomPadding={30}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <IconButton accessibilityLabel="Quitter la partie" onPress={quit}>
          <IconClose size={20} />
        </IconButton>
        <ProgressBar value={(g.index + 1) / QUESTIONS_PER_GAME} height={20} accessibilityLabel={`Question ${g.index + 1} sur ${QUESTIONS_PER_GAME}`} />
        <View
          accessibilityLabel={`${g.timeLeft} secondes restantes`}
          accessibilityLiveRegion={g.timeLeft <= 3 ? 'polite' : 'none'}
          style={{
            width: 54,
            height: 54,
            borderRadius: 27,
            borderWidth: 4,
            borderColor: colors.ink,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: g.timeLeft <= 3 ? colors.orange : colors.pink,
          }}
        >
          <Txt variant="display" size={22}>
            {g.timeLeft}
          </Txt>
        </View>
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
        <Txt variant="label">
          Question {g.index + 1}/{QUESTIONS_PER_GAME}
        </Txt>
        <Chip label={modeLabel} bg={modeColor} color={onColor(modeColor)} />
      </View>

      <Brutal tilt={-1.5} style={{ marginTop: 26 }} contentStyle={{ padding: 20, paddingBottom: 18, overflow: 'visible' }}>
        <Chip label={`${expression?.place ?? ''} · ${expression?.lang ?? ''}`} bg={colors.orange} size={12} uppercase />
        <Txt variant="display" size={29} style={{ marginTop: 14, paddingRight: 10, lineHeight: 32 }} accessibilityRole="header">
          {q.expr}
        </Txt>
        <Txt variant="marker" size={22} color={colors.pink} style={{ marginTop: 10 }}>
          ça veut dire quoi ?
        </Txt>
        {g.hintShown ? (
          <FadeIn>
            <Txt variant="marker" size={18} color={colors.blue} style={{ marginTop: 6 }}>
              indice : {q.hint}
            </Txt>
          </FadeIn>
        ) : null}
        <View style={{ position: 'absolute', right: -14, top: -46, transform: [{ rotate: '8deg' }] }} pointerEvents="none">
          <Bulle color={colors.lime} mood="think" acc={look} size={74} />
        </View>
      </Brutal>

      <View style={{ gap: 12, marginTop: 24 }}>
        {q.answers.map((answer, i) => {
          const hidden = g.hidden.includes(i);
          return (
            <View key={answer} style={{ opacity: hidden ? 0 : 1 }} pointerEvents={hidden ? 'none' : 'auto'} accessibilityElementsHidden={hidden}>
              <Button minHeight={60} disabled={hidden} accessibilityLabel={`Réponse ${LETTERS[i]} : ${answer}`} onPress={() => g.answer(i, useAppStore.getState().unlocked)}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 10,
                      borderWidth: 3,
                      borderColor: colors.ink,
                      backgroundColor: LETTER_COLORS[i],
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Txt variant="display" size={15} color={onColor(LETTER_COLORS[i] ?? colors.lime)}>
                      {LETTERS[i]}
                    </Txt>
                  </View>
                  <Txt variant="bold" size={18} style={{ flex: 1 }}>
                    {answer}
                  </Txt>
                </View>
              </Button>
            </View>
          );
        })}
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 12, marginTop: 22 }}>
        <ChipButton label="Joker 50/50" bg={colors.violet} disabled={g.used5050} onPress={() => g.use5050()} />
        <ChipButton label="Indice" bg={colors.lime} disabled={g.usedHint} onPress={() => g.useHint()} />
      </View>
    </Screen>
  );
}
