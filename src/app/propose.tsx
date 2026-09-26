import { useState } from 'react';
import { ActivityIndicator, Alert, View } from 'react-native';
import { SelectModal } from '@/components/SelectModal';
import { Brutal, Button, Chip, ChipButton, Header, Screen, TextField, Txt, useToast } from '@/components/ui';
import { CITIES } from '@/data/places';
import { useAsync } from '@/hooks/useAsync';
import { checkProposal } from '@/logic/moderation';
import { backend, type VoteChoice } from '@/services/backend';
import { playerContext, useAppStore } from '@/store/app';
import { colors, stroke } from '@/theme';

const ORIGINS = [...CITIES.map((c) => c.name), 'Internet', 'Autre'];

/** Proposer une expression et voter pour celles des autres. */
export default function Propose() {
  const toast = useToast();
  const city = useAppStore((s) => s.city);
  const customCity = useAppStore((s) => s.customCity);
  const [word, setWord] = useState('');
  const [mean, setMean] = useState('');
  const [example, setExample] = useState('');
  const [origin, setOrigin] = useState(city);
  const [originOpen, setOriginOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const queue = useAsync(() => backend.voteQueue(playerContext()), []);
  const [voteIdx, setVoteIdx] = useState(0);
  const [voted, setVoted] = useState<{ choice: VoteChoice; pct: number } | null>(null);
  const card = queue.data?.[voteIdx];

  const send = async () => {
    const check = checkProposal(word, mean);
    if (!check.ok) {
      setError(check.reason);
      return;
    }
    setSending(true);
    try {
      await backend.submitProposal(playerContext(), { word, mean, origin, example: example || undefined });
      setWord('');
      setMean('');
      setExample('');
      setError(null);
      toast.show(
        customCity && backend.isDemo
          ? `Validée par le jury élargi : +1 expression pour ${city}`
          : `Merci ! Elle part au vote des joueurs de ${origin}.`,
      );
    } catch (e) {
      toast.show(e instanceof Error ? e.message : 'Envoi impossible, réessaie.');
    } finally {
      setSending(false);
    }
  };

  const vote = async (choice: VoteChoice) => {
    if (!card) return;
    try {
      const { pct } = await backend.vote(playerContext(), card.id, choice);
      setVoted({ choice, pct });
      if (choice === 'other') toast.show('Merci, la proposition sera vérifiée.');
    } catch (e) {
      toast.show(e instanceof Error ? e.message : 'Vote impossible.');
    }
  };

  const report = async () => {
    if (!card) return;
    try {
      await backend.report(playerContext(), { type: 'proposal', id: card.id }, 'Signalée depuis la file de vote');
      toast.show('Merci, un modérateur va regarder.');
      setVoted(null);
      setVoteIdx((i) => i + 1);
    } catch {
      toast.show('Signalement impossible, réessaie.');
    }
  };

  const blockAuthor = () => {
    if (!card) return;
    Alert.alert('Bloquer cet auteur ?', 'Ses prochaines propositions ne te seront plus présentées.', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Bloquer',
        style: 'destructive',
        onPress: async () => {
          try {
            await backend.blockProposalAuthor(playerContext(), card.id);
            toast.show('Auteur bloqué.');
            setVoted(null);
            setVoteIdx((i) => i + 1);
          } catch {
            toast.show('Blocage impossible, réessaie.');
          }
        },
      },
    ]);
  };

  return (
    <Screen>
      <Header title="Propose une expression" titleSize={24} />
      <Txt size={16} style={{ marginTop: 14 }}>
        Les joueurs de ta ville votent. Si elle est validée, elle entre dans le jeu avec ton pseudo.
      </Txt>
      <View style={{ marginTop: 12, borderWidth: stroke.medium, borderStyle: 'dashed', borderColor: colors.ink, borderRadius: 16, padding: 12 }}>
        <Txt variant="semi" size={14}>
          Les règles : pas d’insulte, pas de nom de vraie personne, pas de contenu sexuel. Tout est relu avant d’entrer dans le jeu.
        </Txt>
      </View>

      <View style={{ gap: 14, marginTop: 16 }}>
        <TextField label="L'expression" value={word} onChangeText={setWord} placeholder="ex. C'est giga" maxLength={60} autoCorrect={false} />
        <TextField label="Ça veut dire quoi ?" value={mean} onChangeText={setMean} placeholder="ex. c'est énorme" maxLength={120} />
        <View>
          <Txt variant="label">D’où elle vient ?</Txt>
          <ChipButton label={`${origin}  ▾`} style={{ marginTop: 8, alignSelf: 'flex-start' }} onPress={() => setOriginOpen(true)} />
        </View>
        <TextField label="Un exemple (facultatif)" value={example} onChangeText={setExample} placeholder="ex. Ce concert, c'était giga" maxLength={160} />
      </View>
      {error ? (
        <Txt variant="semi" size={14} style={{ marginTop: 10, backgroundColor: colors.pink, alignSelf: 'flex-start', paddingHorizontal: 8, borderRadius: 6 }} accessibilityLiveRegion="polite">
          {error}
        </Txt>
      ) : null}
      <Button variant="cta" label={sending ? 'ENVOI…' : 'ENVOYER AU VOTE'} bg={colors.pink} style={{ marginTop: 20 }} disabled={sending} onPress={send} />

      <Txt variant="display" size={23} style={{ marginTop: 30 }} accessibilityRole="header">
        À toi de voter
      </Txt>
      {queue.loading && !queue.data ? <ActivityIndicator color={colors.ink} style={{ marginTop: 16 }} /> : null}
      {card ? (
        <Brutal bg={colors.lime} style={{ marginTop: 12 }} contentStyle={{ padding: 16 }}>
          <Chip label={card.place} size={12} />
          <Txt variant="display" size={26} style={{ marginTop: 10 }}>
            {card.word}
          </Txt>
          <Txt size={16} style={{ marginTop: 4 }}>
            Ça voudrait dire : <Txt variant="bold">{card.mean}</Txt>
          </Txt>
          {voted ? (
            <>
              <Txt variant="bold" size={16} style={{ marginTop: 12 }}>
                {voted.choice === 'other' ? 'Merci pour ton avis !' : `${voted.pct} % de la communauté a voté comme toi.`}
              </Txt>
              <Button
                label="Suivante"
                align="center"
                bg={colors.ink}
                color={colors.lime}
                style={{ marginTop: 10 }}
                onPress={() => {
                  setVoted(null);
                  setVoteIdx((i) => i + 1);
                }}
              />
            </>
          ) : (
            <>
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 14 }}>
                <ChipButton label="Vrai" style={{ flex: 1 }} onPress={() => vote('yes')} />
                <ChipButton label="Faux" bg={colors.violet} style={{ flex: 1 }} onPress={() => vote('no')} />
                <ChipButton label="À corriger" bg={colors.cream} size={13} style={{ flex: 1.3 }} onPress={() => vote('other')} />
              </View>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
                <ChipButton label="Signaler" dashed flat bg={colors.lime} size={13} onPress={report} />
                <ChipButton label="Bloquer l’auteur" dashed flat bg={colors.pink} size={13} onPress={blockAuthor} />
              </View>
            </>
          )}
        </Brutal>
      ) : queue.data ? (
        <Txt variant="marker" size={21} color={colors.pink} style={{ marginTop: 14 }}>
          t’as tout voté. Reviens demain !
        </Txt>
      ) : null}

      <SelectModal visible={originOpen} title="D'où elle vient ?" options={customCity ? [city, ...ORIGINS] : ORIGINS} selected={origin} onSelect={setOrigin} onClose={() => setOriginOpen(false)} />
    </Screen>
  );
}
