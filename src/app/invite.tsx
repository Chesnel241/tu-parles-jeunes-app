import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { Bulle } from '@/components/brand/Bulle';
import { Button, Sheet, Txt, useToast } from '@/components/ui';
import { lastSubmission } from '@/features/submission';
import { backend } from '@/services/backend';
import { config } from '@/services/config';
import { copyText, duelLink, shareText } from '@/services/share';
import { playerContext, useAppStore } from '@/store/app';
import { colors } from '@/theme';

/** Feuille « Défie un pote » / « Invite tes potes » avec aperçu du message. */
export default function Invite() {
  const { context } = useLocalSearchParams<{ context?: string }>();
  const isCity = context === 'city';
  const toast = useToast();
  const pseudo = useAppStore((s) => s.pseudo) || 'Ton pote';
  const city = useAppStore((s) => s.city);
  const [link, setLink] = useState<string | null>(isCity ? config.shareBaseUrl : null);
  const [busy, setBusy] = useState(false);

  const message = isCity
    ? `Viens jouer à Tu parles jeune ? et aide-moi à ouvrir ${city} ! Il nous manque des joueurs.`
    : `${pseudo} te défie sur Tu parles jeune ? 5 expressions, 10 secondes chacune. T'as 24 h.`;

  const ensureLink = async (): Promise<string | null> => {
    if (link) return link;
    setBusy(true);
    try {
      await lastSubmission();
      const { id } = await backend.createDuelFromLastGame(playerContext());
      const url = duelLink(id);
      setLink(url);
      return url;
    } catch (e) {
      toast.show(e instanceof Error ? e.message : 'Impossible de créer le défi.');
      return null;
    } finally {
      setBusy(false);
    }
  };

  const afterShare = async () => {
    if (isCity && backend.isDemo) {
      const status = await backend.simulateInviteJoin(playerContext());
      if (status?.opened) {
        router.dismissTo('/city/opened');
        return;
      }
      if (status) toast.show(`Un pote a rejoint ${city} ! ${status.players}/${status.pioneer ? 10 : 30} joueurs`);
    }
    router.back();
  };

  const send = async () => {
    const url = await ensureLink();
    if (!url) return;
    const shared = await shareText(message, url);
    if (shared) await afterShare();
  };

  const copy = async () => {
    const url = await ensureLink();
    if (!url) return;
    await copyText(`${message} ${url}`);
    toast.show('Lien copié, colle-le où tu veux.');
  };

  return (
    <Sheet title={isCity ? 'Invite tes potes' : 'Défie un pote'} onClose={() => router.back()}>
      <View style={{ marginTop: 10, backgroundColor: colors.chatBg, borderRadius: 22, padding: 14 }}>
        <View style={{ backgroundColor: colors.chatBubble, borderRadius: 16, borderBottomRightRadius: 4, padding: 10, marginLeft: 34 }}>
          <View style={{ backgroundColor: colors.lime, borderWidth: 3, borderColor: colors.ink, borderRadius: 12, height: 118, overflow: 'hidden' }}>
            <Txt variant="display" size={20} style={{ position: 'absolute', left: 12, top: 12, lineHeight: 22 }}>
              {isCity ? `Team\n${city}` : `${pseudo}\nte défie`}
            </Txt>
            <View style={{ position: 'absolute', right: 4, bottom: -4 }}>
              <Bulle color={colors.pink} mood="proud" acc="shades" size={92} />
            </View>
          </View>
          <Txt size={15} color={colors.chatText} style={{ marginTop: 8 }}>
            <Txt variant="bold" size={15} color={colors.chatText}>
              Tu parles jeune ?
            </Txt>
            {'\n'}
            {isCity ? 'Aide-moi à ouvrir notre ville dans le jeu.' : '5 expressions, 10 secondes chacune. T’as 24 h.'}
          </Txt>
          <Txt size={14} color={colors.chatLink} style={{ marginTop: 4 }}>
            {link ?? `${config.shareBaseUrl.replace(/^https?:\/\//, '')}/duel/…`}
          </Txt>
        </View>
      </View>
      <View style={{ flexDirection: 'row', gap: 12, marginTop: 18 }}>
        <Button label={busy ? 'Un instant…' : isCity ? 'Inviter' : 'Envoyer le défi'} bg={colors.lime} align="center" style={{ flex: 1 }} disabled={busy} onPress={send} />
        <Button label="Copier le lien" align="center" style={{ flex: 1 }} disabled={busy} onPress={copy} />
      </View>
    </Sheet>
  );
}
