import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Linking, View } from 'react-native';
import { SelectModal } from '@/components/SelectModal';
import { Button, Chip, ChipButton, Header, Screen, Txt, useToast } from '@/components/ui';
import { allowedCitiesFor } from '@/data/allowedCities';
import { CITIES, COUNTRIES, FEATURED_NEW_COUNTRIES } from '@/data/places';
import { backend } from '@/services/backend';
import { config } from '@/services/config';
import { playerContext, useAppStore } from '@/store/app';
import { colors } from '@/theme';

/** « Ma ville n'est pas dans la liste » : personne ne reste dehors. */
export default function NewCity() {
  const { from } = useLocalSearchParams<{ from?: string }>();
  const fromOnboarding = from === 'onboarding';
  const toast = useToast();
  const chooseCity = useAppStore((s) => s.chooseCity);
  const launchCity = useAppStore((s) => s.launchCity);
  const [country, setCountry] = useState<string>('Tchad');
  const [city, setCity] = useState<string | null>(null);
  const [otherOpen, setOtherOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const cities = allowedCitiesFor(country);
  const openCity = city ? CITIES.find((c) => c.name === city && c.country === country) : undefined;
  const countries = FEATURED_NEW_COUNTRIES.includes(country) ? FEATURED_NEW_COUNTRIES : [country, ...FEATURED_NEW_COUNTRIES];

  const launch = async () => {
    if (!city) return;
    if (openCity) {
      chooseCity(openCity.name);
      toast.show(`${openCity.name} est déjà dans le jeu, bienvenue dans la team !`);
      if (fromOnboarding) router.replace('/onboarding/universe');
      else router.back();
      return;
    }
    setBusy(true);
    try {
      await backend.requestCity({ ...playerContext(), city, country, customCity: true }, city, country);
      launchCity(city, country);
      toast.show(`${city} est en chantier. Tu joues déjà pour Team ${country} !`);
      router.replace({ pathname: '/city/chantier', params: { from: fromOnboarding ? 'onboarding' : 'app' } });
    } catch (e) {
      toast.show(e instanceof Error ? e.message : 'Impossible pour le moment, réessaie.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View style={{ flex: 1 }}>
          <Header />
        </View>
        <Chip label="Ouvre ta ville" bg={colors.orange} />
      </View>
      <Txt variant="marker" size={22} color={colors.pink} tilt={-2} style={{ marginTop: 22 }}>
        personne ne reste dehors
      </Txt>
      <Txt variant="display" size={31} style={{ marginTop: 6 }} accessibilityRole="header">
        Ta ville n’est pas encore là ?
      </Txt>
      <Txt size={16} style={{ marginTop: 12 }}>
        Tu joues quand même, tout de suite. Tes points comptent pour ton pays dans la Coupe des pays, et tu lances ta ville avec tes potes.
      </Txt>

      <Txt variant="label" style={{ marginTop: 20 }}>
        Ton pays
      </Txt>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 10, marginTop: 10 }}>
        {countries.map((c) => (
          <View key={c} style={{ width: '48%' }}>
            <ChipButton
              label={country === c ? `✓ ${c}` : c}
              bg={country === c ? colors.orange : colors.white}
              selected={country === c}
              onPress={() => {
                setCountry(c);
                setCity(null);
              }}
            />
          </View>
        ))}
      </View>
      <ChipButton label="Autre pays…" dashed flat bg={colors.cream} style={{ marginTop: 10, alignSelf: 'flex-start' }} onPress={() => setOtherOpen(true)} />

      <Txt variant="label" style={{ marginTop: 20 }}>
        Ta ville
      </Txt>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 10 }}>
        {cities.map((c) => (
          <ChipButton key={c} label={city === c ? `✓ ${c}` : c} bg={city === c ? colors.lime : colors.white} selected={city === c} onPress={() => setCity(c)} />
        ))}
      </View>
      <Txt variant="semi" size={13} style={{ marginTop: 10 }}>
        Les villes viennent d’une liste officielle : pas de nom inventé ni de blague.{' '}
        <Txt
          variant="bold"
          size={13}
          color={colors.blue}
          accessibilityRole="link"
          onPress={() => Linking.openURL(`mailto:${config.supportEmail}?subject=${encodeURIComponent(`Ajouter ma ville (${country})`)}`).catch(() => undefined)}
        >
          Ta ville manque ? Écris-nous.
        </Txt>
      </Txt>

      <Button
        variant="cta"
        label={busy ? 'UN INSTANT…' : 'LANCER MA VILLE'}
        bg={colors.ink}
        color={colors.lime}
        style={{ marginTop: 22 }}
        disabled={!city || busy}
        onPress={launch}
      />

      <SelectModal
        visible={otherOpen}
        title="Choisis ton pays"
        options={COUNTRIES}
        selected={country}
        onSelect={(c) => {
          setCountry(c);
          setCity(null);
        }}
        onClose={() => setOtherOpen(false)}
      />
    </Screen>
  );
}
