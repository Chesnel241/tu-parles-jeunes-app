import { Image, StyleSheet, View } from 'react-native';

const GRAIN = require('../../../assets/brand/grain.png');

/** Grain papier très léger posé sur tout l'écran (7 %), comme dans la maquette. */
export function Grain() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill} accessible={false} importantForAccessibility="no-hide-descendants">
      <Image source={GRAIN} resizeMode="repeat" style={{ opacity: 0.07, width: '100%', height: '100%' }} />
    </View>
  );
}
