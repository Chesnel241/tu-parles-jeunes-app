import { Image } from 'react-native';

const LOGO = require('../../../assets/brand/logo.png');

/**
 * Logo officiel (bulle blanche, « TU PARLES JEUNE », pastille rose « ? »).
 * Fourni en image pour un rendu identique à l'identité validée sur tous les téléphones.
 */
export function Logo({ width = 340, variant = 'white' }: { width?: number; variant?: 'white' | 'lime' | 'cream' }) {
  const source = variant === 'lime' ? require('../../../assets/brand/logo-lime.png') : variant === 'cream' ? require('../../../assets/brand/logo-cream.png') : LOGO;
  return (
    <Image
      source={source}
      accessibilityRole="image"
      accessibilityLabel="Tu parles jeune ?"
      style={{ width, height: Math.round((width * 520) / 1080) }}
      resizeMode="contain"
    />
  );
}
