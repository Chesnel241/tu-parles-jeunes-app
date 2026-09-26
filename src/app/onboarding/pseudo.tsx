import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import { View } from 'react-native';
import { Bulle } from '@/components/brand/Bulle';
import { OnboardingFrame } from '@/components/OnboardingFrame';
import { Brutal, ChipButton, TextField, Txt } from '@/components/ui';
import type { AgeRange } from '@/data/types';
import { checkPseudo } from '@/logic/moderation';
import { config } from '@/services/config';
import { useAppStore } from '@/store/app';
import { colors } from '@/theme';

const AGES: { id: AgeRange; label: string }[] = [
  { id: 'under13', label: 'Moins de 13 ans' },
  { id: '13-15', label: '13 à 15 ans' },
  { id: '16-17', label: '16 ou 17 ans' },
  { id: '18+', label: '18 ans et +' },
];

/** Étape 1 : pseudo et tranche d'âge (obligatoire pour la conformité RGPD / stores). */
export default function PseudoStep() {
  const storedPseudo = useAppStore((s) => s.pseudo);
  const storedAge = useAppStore((s) => s.ageRange);
  const setPseudo = useAppStore((s) => s.setPseudo);
  const setAgeRange = useAppStore((s) => s.setAgeRange);
  const termsAcceptedAt = useAppStore((s) => s.termsAcceptedAt);
  const acceptTerms = useAppStore((s) => s.acceptTerms);
  const [pseudo, setLocal] = useState(storedPseudo);
  const [age, setAge] = useState<AgeRange | null>(storedAge);
  const [error, setError] = useState<string | null>(null);

  const tooYoung = age === 'under13';

  const next = () => {
    const check = checkPseudo(pseudo);
    if (!check.ok) {
      setError(check.reason);
      return;
    }
    if (!age || tooYoung || !termsAcceptedAt) return;
    setPseudo(pseudo);
    setAgeRange(age);
    router.push('/onboarding/city');
  };

  return (
    <OnboardingFrame
      step={1}
      kicker="on fait connaissance"
      title="Comment on t'appelle ?"
      intro="C'est le pseudo que verront tes potes dans les duels et les classements."
      cta="SUIVANT"
      onNext={next}
      ctaDisabled={!age || tooYoung || !termsAcceptedAt || pseudo.trim().length < 2}
    >
      <TextField
        label="Ton pseudo"
        value={pseudo}
        onChangeText={(t) => {
          setLocal(t.slice(0, 16));
          setError(null);
        }}
        placeholder="ex. Inès"
        maxLength={16}
        autoCapitalize="words"
        autoCorrect={false}
        autoComplete="off"
        textContentType="nickname"
        returnKeyType="done"
        error={error}
      />
      <Txt variant="label" style={{ marginTop: 22 }}>
        Ton âge
      </Txt>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 10 }}>
        {AGES.map((a) => (
          <ChipButton
            key={a.id}
            label={age === a.id ? `✓ ${a.label}` : a.label}
            bg={age === a.id ? colors.lime : colors.white}
            selected={age === a.id}
            onPress={() => setAge(a.id)}
          />
        ))}
      </View>
      {tooYoung ? (
        <Brutal bg={colors.pink} style={{ marginTop: 18 }} contentStyle={{ padding: 14 }}>
          <Txt variant="bold" size={16}>
            Le jeu est réservé aux 13 ans et plus.
          </Txt>
          <Txt size={14} style={{ marginTop: 4 }}>
            Reviens nous voir dans quelques années, on te gardera une place !
          </Txt>
        </Brutal>
      ) : (
        <View style={{ alignItems: 'center', marginTop: 28 }}>
          <Bulle color={colors.white} mood="think" size={140} />
        </View>
      )}
      {!tooYoung ? (
        <View style={{ marginTop: 18, gap: 8 }}>
          <ChipButton
            label={termsAcceptedAt ? '✓ CGU et règles acceptées' : "J'accepte les CGU et les règles"}
            bg={termsAcceptedAt ? colors.lime : colors.white}
            selected={Boolean(termsAcceptedAt)}
            onPress={acceptTerms}
          />
          <Txt size={13}>
            En continuant, tu acceptes les{' '}
            <Txt variant="bold" size={13} color={colors.blue} accessibilityRole="link" onPress={() => WebBrowser.openBrowserAsync(config.termsUrl).catch(() => undefined)}>
              conditions d’utilisation
            </Txt>{' '}
            et la{' '}
            <Txt variant="bold" size={13} color={colors.blue} accessibilityRole="link" onPress={() => WebBrowser.openBrowserAsync(config.privacyUrl).catch(() => undefined)}>
              politique de confidentialité
            </Txt>
            .
          </Txt>
        </View>
      ) : null}
    </OnboardingFrame>
  );
}
