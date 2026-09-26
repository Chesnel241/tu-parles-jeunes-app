import { Modal, ScrollView, View } from 'react-native';
import { ChipButton, Sheet } from '@/components/ui';
import { colors } from '@/theme';

type Props = {
  visible: boolean;
  title: string;
  options: readonly string[];
  selected: string | null;
  onSelect: (value: string) => void;
  onClose: () => void;
};

/** Liste de choix dans une feuille du bas (pays de cœur, etc.). */
export function SelectModal({ visible, title, options, selected, onSelect, onClose }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <Sheet title={title} onClose={onClose}>
        <ScrollView style={{ maxHeight: 420 }} contentContainerStyle={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingTop: 8, paddingBottom: 8 }}>
          {options.map((opt) => (
            <View key={opt}>
              <ChipButton
                label={opt === selected ? `✓ ${opt}` : opt}
                bg={opt === selected ? colors.lime : colors.white}
                selected={opt === selected}
                onPress={() => {
                  onSelect(opt);
                  onClose();
                }}
              />
            </View>
          ))}
        </ScrollView>
      </Sheet>
    </Modal>
  );
}
