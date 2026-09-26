import { useState } from 'react';
import { TextInput, View, type TextInputProps } from 'react-native';
import { colors, fonts, stroke } from '@/theme';
import { Txt } from './Txt';

type Props = TextInputProps & {
  label: string;
  error?: string | null;
};

/** Champ de saisie néo-brutaliste avec libellé (accessible). L'ombre passe au bleu quand on écrit. */
export function TextField({ label, error, style, onFocus, onBlur, ...rest }: Props) {
  const [focused, setFocused] = useState(false);
  return (
    <View>
      <Txt variant="label">{label}</Txt>
      <View style={{ marginTop: 8, marginRight: 4, marginBottom: 4 }}>
        <View
          pointerEvents="none"
          style={{ position: 'absolute', top: 4, left: 4, right: -4, bottom: -4, borderRadius: 16, backgroundColor: focused ? colors.blue : colors.ink }}
        />
        <TextInput
          accessibilityLabel={label}
          placeholderTextColor="rgba(18,18,18,0.4)"
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          style={[
            {
              position: 'relative',
              borderWidth: stroke.thick,
              borderColor: colors.ink,
              borderRadius: 16,
              paddingVertical: 12,
              paddingHorizontal: 14,
              fontFamily: fonts.bodySemi,
              fontSize: 18,
              color: colors.ink,
              backgroundColor: colors.white,
            },
            style,
          ]}
          {...rest}
        />
      </View>
      {error ? (
        <Txt variant="semi" size={14} color={colors.ink} style={{ marginTop: 6, backgroundColor: colors.pink, alignSelf: 'flex-start', paddingHorizontal: 8, borderRadius: 6 }} accessibilityLiveRegion="polite">
          {error}
        </Txt>
      ) : null}
    </View>
  );
}
