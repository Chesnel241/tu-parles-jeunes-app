import Constants from 'expo-constants';
import { router, useFocusEffect } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useCallback, useState } from 'react';
import { Alert, Linking, Pressable, View } from 'react-native';
import { Bulle } from '@/components/brand/Bulle';
import { IconChevron } from '@/components/brand/Icons';
import { SelectModal } from '@/components/SelectModal';
import { Brutal, Button, Chip, ChipButton, CoinChip, Screen, StatCard, Txt, useToast } from '@/components/ui';
import { cityColor, COUNTRIES } from '@/data/places';
import { LOOKS } from '@/data/shop';
import { useAsync } from '@/hooks/useAsync';
import { ads } from '@/services/ads';
import { backend } from '@/services/backend';
import { config } from '@/services/config';
import { tapLight } from '@/services/haptics';
import { purchases } from '@/services/purchases';
import { displayedStreak, playerContext, useAppStore } from '@/store/app';
import { useContentStore } from '@/store/content';
import { colors, onColor, stroke } from '@/theme';

/** Profil : Bulle et ses looks, badges, pays de cœur, pack sans pub, réglages et confidentialité. */
export default function Profile() {
  const toast = useToast();
  const s = useAppStore();
  const [heartOpen, setHeartOpen] = useState(false);
  const price = useAsync(async () => {
    await purchases.init();
    return purchases.noAdsPrice();
  }, []);
  const city = useAsync(() => (s.customCity ? backend.cityStatus(playerContext()) : Promise.resolve(null)), [s.city, s.customCity]);
  useFocusEffect(
    useCallback(() => {
      city.reload();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );
  const teamColor = s.customCity ? colors.orange : cityColor(s.city);
  const opened = Boolean(city.data?.opened);

  const onLook = (id: (typeof LOOKS)[number]['id']) => {
    tapLight();
    const item = LOOKS.find((l) => l.id === id);
    if (!item) return;
    if (item.lockedLabel) {
      toast.show('Aide ta ville à finir dans le top 3 !');
      return;
    }
    if (s.owned.includes(id)) {
      s.equipLook(id);
      return;
    }
    const res = s.buyLook(id);
    if (res === 'ok') toast.show(`${item.name} débloqué !`);
    else if (res === 'poor') toast.show('Pas assez de pièces. Encore une partie ?');
  };

  const buy = async () => {
    const res = await purchases.buyNoAds();
    if (res === 'purchased') {
      s.setNoAds(true);
      toast.show('Merci ! Plus aucune pub.');
    } else if (res === 'error') toast.show('Achat impossible pour le moment.');
  };

  const restore = async () => {
    const ok = await purchases.restore();
    if (ok) s.setNoAds(true);
    toast.show(ok ? 'Achat restauré : plus de pub.' : 'Aucun achat à restaurer.');
  };

  const deleteAccount = () =>
    Alert.alert('Supprimer ton compte ?', 'Ton profil, tes scores et tes propositions seront effacés définitivement.', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          try {
            await backend.deleteAccount();
          } catch {
            toast.show('Suppression impossible. Vérifie ta connexion puis réessaie.');
            return;
          }
          useContentStore.getState().clear();
          useAppStore.getState().resetAll();
          router.replace('/onboarding');
        },
      },
    ]);

  const badges = [
    { name: 'Pionnier', desc: s.customCity ? `A lancé ${s.city}` : 'Lance une ville absente du jeu', on: s.customCity },
    { name: 'Fondateur', desc: opened ? `Fondateur de ${s.city}` : 'Ouvre ta ville avec tes potes', on: s.customCity && opened },
    { name: 'Ambassadeur', desc: '5 expressions validées', on: false },
    { name: "Plume d'or", desc: 'Ton expression élue de la semaine', on: false },
  ];

  return (
    <Screen withTabBar>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Txt variant="display" size={31} style={{ marginTop: 4 }} accessibilityRole="header">
          Profil
        </Txt>
        <CoinChip coins={s.coins} />
      </View>

      <Brutal bg={colors.lime} style={{ marginTop: 16 }} contentStyle={{ padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Bulle color={colors.pink} mood="happy" acc={s.look} size={120} />
        <View style={{ flex: 1 }}>
          <Txt variant="display" size={26}>
            {s.pseudo}
          </Txt>
          <Chip label={`Team ${s.city}`} bg={teamColor} color={onColor(teamColor)} style={{ marginTop: 8 }} />
        </View>
      </Brutal>

      <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
        <StatCard value={String(s.games)} label={s.games > 1 ? 'parties' : 'partie'} />
        <StatCard value={`${displayedStreak(s)} j`} label="de série" />
        <StatCard value={String(s.unlocked.length)} label="expressions" />
      </View>

      <Txt variant="display" size={22} style={{ marginTop: 24 }}>
        Les looks de Bulle
      </Txt>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 12, marginTop: 12 }}>
        {LOOKS.map((l) => {
          const owned = s.owned.includes(l.id);
          const equipped = s.look === l.id;
          const label = l.lockedLabel ?? (equipped ? 'Équipé' : owned ? 'Équiper' : `${l.price} pièces`);
          const tag = l.lockedLabel ? colors.cream : equipped ? colors.ink : owned ? colors.lime : colors.gold;
          return (
            <View key={l.id} style={{ width: '31%' }}>
              <View style={{ position: 'absolute', top: 4, left: 4, right: -4, bottom: -4, borderRadius: 18, backgroundColor: colors.ink }} />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${l.name}, ${label}`}
                accessibilityState={{ selected: equipped }}
                onPress={() => onLook(l.id)}
                style={({ pressed }) => ({
                  borderWidth: stroke.thick,
                  borderColor: colors.ink,
                  borderRadius: 18,
                  backgroundColor: equipped ? colors.lime : colors.white,
                  paddingVertical: 10,
                  paddingHorizontal: 4,
                  alignItems: 'center',
                  transform: pressed ? [{ translateX: 3 }, { translateY: 3 }] : [],
                })}
              >
                <Bulle color={l.color} mood="happy" acc={l.id} size={70} />
                <Txt variant="bold" size={13} align="center" style={{ marginTop: 4 }}>
                  {l.name}
                </Txt>
                <View style={{ marginTop: 6, borderWidth: stroke.thin, borderColor: colors.ink, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 1, backgroundColor: tag }}>
                  <Txt variant="bold" size={11} color={tag === colors.ink ? colors.lime : colors.ink}>
                    {label}
                  </Txt>
                </View>
              </Pressable>
            </View>
          );
        })}
      </View>

      <Txt variant="display" size={22} style={{ marginTop: 24 }}>
        Mes badges
      </Txt>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 12, marginTop: 12 }}>
        {badges.map((b) => (
          <View
            key={b.name}
            accessibilityLabel={`${b.name} : ${b.on ? 'obtenu' : b.desc}`}
            style={{
              width: '48%',
              borderWidth: stroke.medium,
              borderColor: colors.ink,
              borderStyle: b.on ? 'solid' : 'dashed',
              borderRadius: 18,
              padding: 12,
              backgroundColor: b.on ? colors.lime : colors.paper,
              opacity: b.on ? 1 : 0.8,
            }}
          >
            <Txt variant="display" size={16}>
              {b.name}
            </Txt>
            <Txt variant="semi" size={12} style={{ marginTop: 4 }}>
              {b.desc}
            </Txt>
          </View>
        ))}
      </View>

      {s.customCity ? (
        <Button bg={colors.orange} style={{ marginTop: 16 }} onPress={() => router.push(opened ? '/rankings' : '/city/chantier')}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={{ flex: 1 }}>
              <Txt variant="label" size={11}>
                Ma ville
              </Txt>
              <Txt variant="bold" size={17}>
                {s.city} : {opened ? 'ouverte, bravo !' : `${city.data?.players ?? '…'} joueurs, ${city.data?.expressions ?? '…'} expressions`}
              </Txt>
            </View>
            <IconChevron />
          </View>
        </Button>
      ) : null}

      <Brutal style={{ marginTop: 20 }} contentStyle={{ padding: 16 }}>
        <Txt variant="label">Pays de cœur</Txt>
        <ChipButton label={`${s.heart ?? 'Aucun'}  ▾`} style={{ marginTop: 8, alignSelf: 'flex-start' }} onPress={() => setHeartOpen(true)} />
        <Txt size={14} style={{ marginTop: 10 }}>
          Tu vis à {s.city} mais tes racines sont ailleurs ? Tes points comptent pour ta ville et aussi pour ce pays dans la Coupe des pays.
        </Txt>
      </Brutal>

      {purchases.available || s.noAds ? (
        <Brutal bg={colors.pink} style={{ marginTop: 20 }} contentStyle={{ padding: 16, gap: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Txt variant="display" size={20}>
                Pack sans pub
              </Txt>
              <Txt variant="semi" size={14} style={{ marginTop: 4 }}>
                Plus aucune pub. Les bonus restent à toi.
              </Txt>
            </View>
            <Button
              label={s.noAds ? 'Activé' : price.data ?? '…'}
              bg={colors.ink}
              color={colors.lime}
              align="center"
              offset={0}
              disabled={s.noAds || !price.data}
              onPress={buy}
            />
          </View>
          {!s.noAds ? (
            <Txt variant="bold" size={14} accessibilityRole="button" onPress={restore} style={{ textDecorationLine: 'underline' }}>
              Restaurer mes achats
            </Txt>
          ) : null}
        </Brutal>
      ) : null}

      <Button label="Changer de team" align="center" style={{ marginTop: 16 }} onPress={() => router.push('/onboarding/city')} />

      <Txt variant="display" size={22} style={{ marginTop: 26 }}>
        Réglages
      </Txt>
      <View style={{ gap: 10, marginTop: 12 }}>
        <SettingRow label="Confidentialité et pubs" onPress={() => ads.openPrivacyOptions()} />
        <SettingRow label="Politique de confidentialité" onPress={() => WebBrowser.openBrowserAsync(config.privacyUrl).catch(() => undefined)} />
        <SettingRow label="Conditions d'utilisation" onPress={() => WebBrowser.openBrowserAsync(config.termsUrl).catch(() => undefined)} />
        <SettingRow label="Nous contacter" onPress={() => Linking.openURL(`mailto:${config.supportEmail}`).catch(() => undefined)} />
        <SettingRow label="Supprimer mon compte" danger onPress={deleteAccount} />
      </View>
      <Txt variant="semi" size={12} align="center" style={{ marginTop: 18, opacity: 0.6 }}>
        Tu parles jeune ? · version {Constants.expoConfig?.version ?? '1.0.0'}
        {backend.isDemo ? ' · mode démo' : ''}
      </Txt>

      <SelectModal
        visible={heartOpen}
        title="Ton pays de cœur"
        options={['Aucun', ...COUNTRIES]}
        selected={s.heart ?? 'Aucun'}
        onSelect={(v) => s.setHeart(v === 'Aucun' ? null : v)}
        onClose={() => setHeartOpen(false)}
      />
    </Screen>
  );
}

function SettingRow({ label, onPress, danger }: { label: string; onPress: () => void; danger?: boolean }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => {
        tapLight();
        onPress();
      }}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        minHeight: 50,
        paddingHorizontal: 16,
        borderWidth: stroke.medium,
        borderColor: colors.ink,
        borderRadius: 16,
        backgroundColor: danger ? colors.pink : colors.white,
        opacity: pressed ? 0.8 : 1,
      })}
    >
      <Txt variant="bold" size={16}>
        {label}
      </Txt>
      <IconChevron size={18} />
    </Pressable>
  );
}
