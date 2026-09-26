import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconBook, IconHome, IconTrophy, IconUser } from '@/components/brand/Icons';
import { TAB_BAR_HEIGHT, Txt } from '@/components/ui';
import { tapLight } from '@/services/haptics';
import { colors, stroke } from '@/theme';

type TabRoute = { key: string; name: string };
type Props = {
  state: { index: number; routes: TabRoute[] };
  navigation: { navigate: (name: string) => void; emit: (e: { type: 'tabPress'; target: string; canPreventDefault: true }) => { defaultPrevented: boolean } };
};

const TABS: Record<string, { label: string; Icon: typeof IconHome }> = {
  index: { label: 'Jouer', Icon: IconHome },
  rankings: { label: 'Classements', Icon: IconTrophy },
  lexik: { label: 'Lexik', Icon: IconBook },
  profile: { label: 'Profil', Icon: IconUser },
};

/** Barre d'onglets : fond blanc, trait noir épais, icône dans un cadre vert quand l'onglet est actif. */
export function TabBar({ state, navigation }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View
      accessibilityRole="tablist"
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: TAB_BAR_HEIGHT + insets.bottom,
        paddingBottom: insets.bottom + 6,
        paddingHorizontal: 6,
        backgroundColor: colors.white,
        borderTopWidth: stroke.thick,
        borderTopColor: colors.ink,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
      }}
    >
      {state.routes.map((route, i) => {
        const tab = TABS[route.name];
        if (!tab) return null;
        const active = state.index === i;
        const { Icon } = tab;
        return (
          <Pressable
            key={route.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={tab.label}
            onPress={() => {
              tapLight();
              const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
              if (!active && !event.defaultPrevented) navigation.navigate(route.name);
            }}
            style={{ minWidth: 72, minHeight: 60, alignItems: 'center', justifyContent: 'center', gap: 3 }}
          >
            <View
              style={{
                width: 46,
                height: 34,
                borderWidth: stroke.medium,
                borderColor: colors.ink,
                borderRadius: 12,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: active ? colors.lime : colors.white,
              }}
            >
              <Icon size={20} />
            </View>
            <Txt variant="bold" size={12}>
              {tab.label}
            </Txt>
          </Pressable>
        );
      })}
    </View>
  );
}
