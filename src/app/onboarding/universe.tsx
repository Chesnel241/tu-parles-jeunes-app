import { router } from 'expo-router';
import { View } from 'react-native';
import { OnboardingFrame } from '@/components/OnboardingFrame';
import { Button, Txt } from '@/components/ui';
import type { Region } from '@/data/types';
import { useAppStore } from '@/store/app';
import { colors, stroke } from '@/theme';

const UNIVERS: { id: Region; label: string; sub: string }[] = [
  { id: 'eu', label: "L'argot d'Europe", sub: 'Verlan, cité, régions, Belgique' },
  { id: 'af', label: "Les argots d'Afrique", sub: 'Nouchi, camfranglais, lingala…' },
  { id: 'web', label: 'Le langage internet', sub: 'Askip, PLS, JPP…' },
  { id: 'darons', label: 'Jeunes vs Darons', sub: 'Les expressions des parents' },
];

/** Étape 3 : les univers préférés (le jeu commence par eux, puis emmène ailleurs). */
export default function UniverseStep() {
  const univers = useAppStore((s) => s.univers);
  const toggle = useAppStore((s) => s.toggleUnivers);
  const complete = useAppStore((s) => s.completeOnboarding);
  const pendingDuelId = useAppStore((s) => s.pendingDuelId);
  const setPendingDuelId = useAppStore((s) => s.setPendingDuelId);

  return (
    <OnboardingFrame
      step={3}
      kicker="dernier truc"
      title="Tu veux jouer sur quoi ?"
      intro="On commence par ce qui te parle, puis on t'emmène ailleurs."
      cta="C'EST PARTI"
      ctaDisabled={univers.length === 0}
      onNext={() => {
        complete();
        if (pendingDuelId) {
          const id = pendingDuelId;
          setPendingDuelId(null);
          router.replace({ pathname: '/duel/[id]', params: { id } });
        } else {
          router.replace('/');
        }
      }}
    >
      <View style={{ gap: 12 }}>
        {UNIVERS.map((u) => {
          const on = univers.includes(u.id);
          return (
            <Button
              key={u.id}
              bg={on ? colors.lime : colors.white}
              onPress={() => toggle(u.id)}
              accessibilityLabel={`${u.label}, ${on ? 'choisi' : 'non choisi'}`}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View
                  style={{
                    width: 30,
                    height: 30,
                    borderWidth: stroke.medium,
                    borderColor: colors.ink,
                    borderRadius: 9,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: on ? colors.ink : colors.white,
                  }}
                >
                  <Txt variant="bold" size={18} color={colors.lime}>
                    {on ? '✓' : ''}
                  </Txt>
                </View>
                <View style={{ flex: 1 }}>
                  <Txt variant="bold" size={18}>
                    {u.label}
                  </Txt>
                  <Txt variant="semi" size={14}>
                    {u.sub}
                  </Txt>
                </View>
              </View>
            </Button>
          );
        })}
      </View>
    </OnboardingFrame>
  );
}
