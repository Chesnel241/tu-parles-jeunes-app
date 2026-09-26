import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Grain } from '@/components/brand/Grain';
import { IconBack } from '@/components/brand/Icons';
import { FadeIn } from '@/components/brand/Motion';
import { Button, IconButton, Txt } from '@/components/ui';
import { colors, stroke } from '@/theme';

type Props = {
  step: 1 | 2 | 3;
  kicker: string;
  title: string;
  intro: string;
  cta: string;
  onNext: () => void;
  ctaDisabled?: boolean;
  onBack?: () => void;
  children: ReactNode;
};

function Dot({ on }: { on: boolean }) {
  return (
    <View
      style={{
        height: 10,
        borderRadius: 5,
        borderWidth: stroke.thin,
        borderColor: colors.ink,
        flex: on ? 2 : 1,
        backgroundColor: on ? colors.pink : colors.white,
      }}
    />
  );
}

/** Mise en page commune aux 3 étapes de l'onboarding (points de progression, titre, bouton bas). */
export function OnboardingFrame({ step, kicker, title, intro, cta, onNext, ctaDisabled, onBack, children }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.cream }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + 18, paddingHorizontal: 20, paddingBottom: 24, flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <IconButton accessibilityLabel="Retour" onPress={() => (onBack ? onBack() : router.back())}>
            <IconBack />
          </IconButton>
          <View style={{ flex: 1, flexDirection: 'row', gap: 8 }} accessibilityLabel={`Étape ${step} sur 3`}>
            <Dot on={step >= 1} />
            <Dot on={step >= 2} />
            <Dot on={step >= 3} />
          </View>
          <Txt variant="label">{step}/3</Txt>
        </View>
        <FadeIn style={{ marginTop: 30 }}>
          <Txt variant="marker" size={22} color={colors.pink} tilt={-2}>
            {kicker}
          </Txt>
          <Txt variant="display" size={34} style={{ marginTop: 8 }} accessibilityRole="header">
            {title}
          </Txt>
          <Txt size={17} style={{ marginTop: 12, marginBottom: 20 }}>
            {intro}
          </Txt>
          {children}
        </FadeIn>
      </ScrollView>
      <View style={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: insets.bottom + 24 }}>
        <Button variant="cta" label={cta} bg={colors.ink} color={colors.lime} onPress={onNext} disabled={ctaDisabled} />
      </View>
      <Grain />
    </KeyboardAvoidingView>
  );
}
