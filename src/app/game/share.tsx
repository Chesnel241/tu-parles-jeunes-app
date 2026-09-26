import { useRef, useState } from 'react';
import { View } from 'react-native';
import { Bulle } from '@/components/brand/Bulle';
import { FadeIn } from '@/components/brand/Motion';
import { Wax } from '@/components/brand/Wax';
import { Brutal, Button, ChipButton, Header, Screen, Txt, useToast } from '@/components/ui';
import { QUESTIONS_PER_GAME } from '@/data/questions';
import { config } from '@/services/config';
import { shareCard, shareText } from '@/services/share';
import { useAppStore } from '@/store/app';
import { useContentStore } from '@/store/content';
import { scoreOf, useGameStore } from '@/store/game';
import { colors } from '@/theme';

/** Cartes verticales prêtes pour TikTok, Instagram et les statuts. */
export default function Share() {
  const toast = useToast();
  const cardRef = useRef<View>(null);
  const [tab, setTab] = useState<'score' | 'expr'>('score');
  const g = useGameStore();
  const app = useAppStore();
  const expressions = useContentStore((s) => s.expressions);
  const score = scoreOf(g);
  const lastKey = g.newUnlocks[g.newUnlocks.length - 1] ?? app.unlocked[app.unlocked.length - 1];
  const expr = (lastKey && expressions.find((expression) => expression.key === lastKey)) || expressions[0];
  const team = (app.customCity ? app.country : app.city).toUpperCase();

  const share = async () => {
    const res = await shareCard(cardRef, 'Partager ma story');
    if (res === 'unavailable') {
      const ok = await shareText(tab === 'score' ? `J'ai fait ${score}/5 sur Tu parles jeune ? Et toi ?` : `Expression du jour : ${expr?.word} = ${expr?.mean}`, config.shareBaseUrl);
      if (!ok) toast.show('Partage indisponible sur cet appareil.');
    } else if (res === 'error') {
      toast.show('Oups, le partage a échoué. Réessaie.');
    }
  };

  return (
    <Screen bg={colors.ink}>
      <Header title="Ta story" color={colors.cream} />
      <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
        <ChipButton label="Mon score" bg={tab === 'score' ? colors.lime : colors.ink} color={tab === 'score' ? colors.ink : colors.cream} borderColor={tab === 'score' ? colors.ink : colors.cream} selected={tab === 'score'} onPress={() => setTab('score')} />
        <ChipButton label="Expression" bg={tab === 'expr' ? colors.lime : colors.ink} color={tab === 'expr' ? colors.ink : colors.cream} borderColor={tab === 'expr' ? colors.ink : colors.cream} selected={tab === 'expr'} onPress={() => setTab('expr')} />
      </View>

      <View style={{ alignItems: 'center', marginTop: 22 }}>
        <View ref={cardRef} collapsable={false} style={{ padding: 8, backgroundColor: colors.ink }}>
          {tab === 'score' ? (
            <FadeIn>
              <View
                style={{
                  width: 250,
                  height: 444,
                  backgroundColor: colors.pink,
                  borderWidth: 5,
                  borderColor: colors.cream,
                  borderRadius: 28,
                  padding: 22,
                  overflow: 'hidden',
                  transform: [{ rotate: '-2deg' }],
                }}
              >
                <Txt variant="label" size={12}>
                  Ma partie du jour
                </Txt>
                <Txt variant="display" size={80} style={{ marginTop: 12, lineHeight: 84 }}>
                  {score}/{QUESTIONS_PER_GAME}
                </Txt>
                <Txt variant="display" size={21} style={{ marginTop: 10, lineHeight: 24 }}>
                  {score >= 4 ? 'Je parle jeune couramment.' : 'Je révise mon argot.'}
                </Txt>
                <Txt variant="marker" size={22} style={{ marginTop: 8 }}>
                  et toi ?
                </Txt>
                <View style={{ position: 'absolute', right: -8, bottom: 50 }}>
                  <Bulle color={colors.lime} mood="proud" acc="crown" size={136} />
                </View>
                <Txt variant="bold" size={12} style={{ position: 'absolute', left: 22, bottom: 18 }}>
                  TEAM {team} · tuparlesjeune
                </Txt>
              </View>
            </FadeIn>
          ) : (
            <FadeIn>
              <View
                style={{
                  width: 250,
                  height: 444,
                  backgroundColor: colors.lime,
                  borderWidth: 5,
                  borderColor: colors.cream,
                  borderRadius: 28,
                  padding: 22,
                  overflow: 'hidden',
                  transform: [{ rotate: '2deg' }],
                }}
              >
                <Txt variant="label" size={12}>
                  Expression du jour
                </Txt>
                <Brutal tilt={-4} radius={6} style={{ marginTop: 22, alignSelf: 'flex-start' }} contentStyle={{ paddingVertical: 8, paddingHorizontal: 12 }}>
                  <Txt variant="display" size={expr && expr.word.length > 10 ? 26 : 34}>
                    {expr?.word}
                  </Txt>
                </Brutal>
                <Txt variant="bold" size={20} style={{ marginTop: 22 }}>
                  = {expr?.mean}
                </Txt>
                <Txt size={15} style={{ marginTop: 6 }}>
                  {expr?.place} · {expr?.lang}
                </Txt>
                <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 130, borderTopWidth: 4, borderColor: colors.ink }}>
                  <Wax variant="color" tile={96} />
                </View>
              </View>
            </FadeIn>
          )}
        </View>
      </View>

      <View style={{ gap: 12, marginTop: 30 }}>
        <Button variant="cta" label="PARTAGER EN STORY" bg={colors.pink} onPress={share} />
        <Button
          label="Envoyer en message"
          align="center"
          onPress={() => shareText(`J'ai fait ${score}/5 sur Tu parles jeune ? Viens me battre !`, config.shareBaseUrl)}
        />
      </View>
    </Screen>
  );
}
