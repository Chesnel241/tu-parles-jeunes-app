import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { Alert, View } from 'react-native';
import { Pop } from '@/components/brand/Motion';
import { Brutal, Button, Chip, Sheet, Txt, useToast } from '@/components/ui';
import { backend } from '@/services/backend';
import { config } from '@/services/config';
import { shareText } from '@/services/share';
import { playerContext } from '@/store/app';
import { useContentStore } from '@/store/content';
import { colors, cycle, onColor, stickerCycle } from '@/theme';

/** Fiche d'une expression du Lexik. */
export default function ExpressionSheet() {
  const { key } = useLocalSearchParams<{ key: string }>();
  const toast = useToast();
  const expressions = useContentStore((s) => s.expressions);
  const e = expressions.find((expression) => expression.key === String(key));
  if (!e) return <Redirect href="/lexik" />;
  const bg = cycle(stickerCycle, expressions.indexOf(e));

  return (
    <Sheet onClose={() => router.back()}>
      <View style={{ alignItems: 'center', marginTop: 4 }}>
        <Pop tilt={-3}>
          <Brutal bg={bg} radius={18} contentStyle={{ paddingVertical: 14, paddingHorizontal: 18 }}>
            <Txt variant="display" size={36} color={onColor(bg)} accessibilityRole="header">
              {e.word}
            </Txt>
          </Brutal>
        </Pop>
      </View>
      <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'center', marginTop: 20 }}>
        <Chip label={e.place} />
        <Chip label={e.lang} bg={colors.orange} />
      </View>
      <Txt size={18} align="center" style={{ marginTop: 16 }}>
        {e.def}
      </Txt>
      <Txt variant="marker" size={20} color={colors.pink} align="center" style={{ marginTop: 10 }}>
        {e.ex}
      </Txt>
      <Txt variant="semi" size={14} align="center" style={{ marginTop: 10 }}>
        Proposée par {e.by}
      </Txt>
      <View style={{ flexDirection: 'row', gap: 12, marginTop: 18 }}>
        <Button label="Partager" bg={colors.pink} align="center" style={{ flex: 1 }} onPress={() => shareText(`${e.word} = ${e.mean} (${e.place}). Tu connaissais ?`, config.shareBaseUrl)} />
        <Button label="Fermer" align="center" style={{ flex: 1 }} onPress={() => router.back()} />
      </View>
      <Button
        label="Signaler une erreur"
        align="center"
        offset={0}
        minHeight={44}
        bg={colors.cream}
        style={{ marginTop: 12 }}
        contentStyle={{ borderStyle: 'dashed', paddingVertical: 8 }}
        onPress={() =>
          backend
            .report(playerContext(), { type: 'expression', id: e.key }, 'Erreur signalée depuis la fiche')
            .then(() => toast.show('Merci, on vérifie.'))
            .catch(() => toast.show('Envoi impossible, réessaie.'))
        }
      />
      {e.key.startsWith('u-') ? (
        <Button
          label="Bloquer l’auteur"
          align="center"
          offset={0}
          minHeight={44}
          bg={colors.pink}
          style={{ marginTop: 10 }}
          onPress={() =>
            Alert.alert('Bloquer cet auteur ?', 'Ses contenus communautaires ne te seront plus proposés.', [
              { text: 'Annuler', style: 'cancel' },
              {
                text: 'Bloquer',
                style: 'destructive',
                onPress: () =>
                  backend
                    .blockExpressionAuthor(playerContext(), e.key)
                    .then(() => toast.show('Auteur bloqué.'))
                    .catch(() => toast.show('Blocage impossible, réessaie.')),
              },
            ])
          }
        />
      ) : null}
    </Sheet>
  );
}
