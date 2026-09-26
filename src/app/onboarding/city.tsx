import { router } from 'expo-router';
import { View } from 'react-native';
import { OnboardingFrame } from '@/components/OnboardingFrame';
import { Button, ChipButton, Txt } from '@/components/ui';
import { CITIES } from '@/data/places';
import { useAppStore } from '@/store/app';
import { colors, onColor } from '@/theme';

/** Étape 2 : choisir sa team (ville), ou lancer sa ville si elle n'existe pas. */
export default function CityStep() {
  const city = useAppStore((s) => s.city);
  const customCity = useAppStore((s) => s.customCity);
  const chooseCity = useAppStore((s) => s.chooseCity);
  const onboarded = useAppStore((s) => s.onboarded);

  return (
    <OnboardingFrame
      step={2}
      kicker="choisis ton camp"
      title="T'es de quelle team ?"
      intro="Chaque bonne réponse fait monter ta ville dans la Guerre des villes."
      cta={onboarded ? "C'EST NOTÉ" : 'SUIVANT'}
      onNext={() => (onboarded ? router.back() : router.push('/onboarding/universe'))}
    >
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 12 }}>
        {CITIES.map((c) => {
          const on = !customCity && c.name === city;
          return (
            <View key={c.name} style={{ width: '48%' }}>
              <ChipButton
                label={on ? `✓ ${c.name}` : c.name}
                bg={on ? c.color : colors.white}
                color={on ? onColor(c.color) : colors.ink}
                selected={on}
                size={16}
                onPress={() => chooseCity(c.name)}
              />
            </View>
          );
        })}
      </View>
      {customCity ? (
        <Txt variant="semi" size={15} style={{ marginTop: 14 }}>
          Ta team actuelle : {city} (en chantier).
        </Txt>
      ) : null}
      <Button bg={colors.orange} style={{ marginTop: 18 }} onPress={() => router.push({ pathname: '/city/new', params: { from: 'onboarding' } })}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flex: 1 }}>
            <Txt variant="bold" size={18}>
              Ma ville n’est pas dans la liste
            </Txt>
            <Txt variant="semi" size={13}>
              Tu joues quand même, pour ton pays
            </Txt>
          </View>
          <Txt variant="display" size={22}>
            +
          </Txt>
        </View>
      </Button>
    </OnboardingFrame>
  );
}
