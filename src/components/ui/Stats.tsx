import { View } from 'react-native';
import { Coin, IconFlame } from '@/components/brand/Icons';
import { formatNumber } from '@/logic/format';
import { colors } from '@/theme';
import { Chip } from './Chip';
import { Txt } from './Txt';

export function CoinChip({ coins }: { coins: number }) {
  return (
    <Chip style={{ paddingVertical: 5, paddingHorizontal: 14 }}>
      <Coin size={20} />
      <Txt variant="bold" size={16} accessibilityLabel={`${coins} pièces`}>
        {formatNumber(coins)}
      </Txt>
    </Chip>
  );
}

export function StreakChip({ days }: { days: number }) {
  return (
    <Chip bg={colors.orange} style={{ paddingVertical: 5, paddingHorizontal: 12 }}>
      <IconFlame size={16} />
      <Txt variant="bold" size={15} accessibilityLabel={`Série de ${days} jours`}>
        {days} {days > 1 ? 'jours' : 'jour'}
      </Txt>
    </Chip>
  );
}

/** Petite carte chiffre + libellé (profil). */
export function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <View
      style={{
        flex: 1,
        marginRight: 4,
        marginBottom: 4,
      }}
    >
      <View style={{ position: 'absolute', top: 4, left: 4, right: -4, bottom: -4, borderRadius: 18, backgroundColor: colors.ink }} />
      <View style={{ borderWidth: 4, borderColor: colors.ink, borderRadius: 18, backgroundColor: colors.white, paddingVertical: 10, paddingHorizontal: 4, alignItems: 'center' }}>
        <Txt variant="display" size={22}>
          {value}
        </Txt>
        <Txt variant="semi" size={13}>
          {label}
        </Txt>
      </View>
    </View>
  );
}
