import type { ReactNode } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { IconBack } from '@/components/brand/Icons';
import { IconButton } from './IconButton';
import { Txt } from './Txt';

type Props = {
  title?: string;
  onBack?: () => void;
  right?: ReactNode;
  color?: string;
  titleSize?: number;
};

/** En-tête d'écran secondaire : bouton retour + titre en Dela Gothic. */
export function Header({ title, onBack, right, color, titleSize = 26 }: Props) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
      <IconButton
        accessibilityLabel="Retour"
        onPress={() => {
          if (onBack) onBack();
          else if (router.canGoBack()) router.back();
          else router.replace('/');
        }}
      >
        <IconBack />
      </IconButton>
      {title ? (
        <Txt variant="display" size={titleSize} color={color} style={{ flex: 1 }} accessibilityRole="header">
          {title}
        </Txt>
      ) : (
        <View style={{ flex: 1 }} />
      )}
      {right}
    </View>
  );
}
