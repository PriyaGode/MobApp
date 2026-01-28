import { Image } from 'expo-image';
import { useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  View,
  type GestureResponderEvent,
} from 'react-native';

import { SAMPLE_AVATARS } from '@/features/profile/constants';
import { ThemedText } from '@/components/superadmin/themed-text';

type AvatarPickerProps = {
  value?: string;
  crop?: number;
  onChange: (uri?: string, crop?: number) => void;
  disabled?: boolean;
};

const cropPresets = [
  { label: 'Tight', value: 1.15 },
  { label: 'Standard', value: 1 },
  { label: 'Wide', value: 0.9 },
];

export function AvatarPicker({ value, crop = 1, onChange, disabled }: AvatarPickerProps) {
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState(value);
  const [localCrop, setLocalCrop] = useState(crop);

  const currentLabel = useMemo(() => {
    const closest = cropPresets.reduce((acc, preset) => {
      return Math.abs(preset.value - crop) < Math.abs(acc.value - crop) ? preset : acc;
    }, cropPresets[0]);
    return closest.label;
  }, [crop]);

  const applyChange = () => {
    onChange(preview, localCrop);
    setOpen(false);
  };

  const handleOpen = () => {
    if (disabled) return;
    setPreview(value);
    setLocalCrop(crop);
    setOpen(true);
  };

  const handleClear = () => {
    onChange(undefined, 1);
    setOpen(false);
  };

  const renderAvatar = ({ item }: { item: string }) => {
    const selected = preview === item;
    return (
      <Pressable
        onPress={() => setPreview(item)}
        style={[styles.choice, selected && styles.choiceSelected]}>
        <Image source={{ uri: item }} style={styles.choiceImage} />
      </Pressable>
    );
  };

  const CropButton = ({
    label,
    value: presetValue,
  }: {
    label: string;
    value: number;
  }) => {
    const selected = Math.abs(localCrop - presetValue) < 0.01;
    const onPress = (event: GestureResponderEvent) => {
      event.stopPropagation();
      setLocalCrop(presetValue);
    };
    return (
      <Pressable onPress={onPress} style={[styles.pill, selected && styles.pillSelected]}>
        <ThemedText style={selected ? styles.pillSelectedText : undefined}>{label}</ThemedText>
      </Pressable>
    );
  };

  return (
    <>
      <Pressable style={[styles.avatar, disabled && styles.avatarDisabled]} onPress={handleOpen}>
        {value ? (
          <Image
            source={{ uri: value }}
            style={[styles.avatarImage, { transform: [{ scale: crop }] }]}
          />
        ) : (
          <ThemedText style={styles.avatarPlaceholder}>Add avatar</ThemedText>
        )}
        <View style={styles.avatarBadge}>
          <ThemedText style={styles.avatarBadgeText}>Edit</ThemedText>
        </View>
        <ThemedText style={styles.cropLabel}>{currentLabel} crop</ThemedText>
      </Pressable>

      <Modal visible={open} animationType="slide" onRequestClose={() => setOpen(false)}>
        <View style={styles.sheet}>
          <ThemedText type="title" style={styles.sheetTitle}>
            Pick an avatar
          </ThemedText>
          <FlatList
            data={SAMPLE_AVATARS}
            renderItem={renderAvatar}
            keyExtractor={(item) => item}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.choices}
          />
          <ThemedText style={styles.sectionLabel}>Crop</ThemedText>
          <View style={styles.cropRow}>
            {cropPresets.map((preset) => (
              <CropButton key={preset.label} {...preset} />
            ))}
          </View>
          <View style={styles.actions}>
            <Pressable style={[styles.actionButton, styles.secondary]} onPress={handleClear}>
              <ThemedText style={styles.secondaryText}>Remove</ThemedText>
            </Pressable>
            <Pressable style={[styles.actionButton, styles.primary]} onPress={applyChange}>
              <ThemedText style={styles.primaryText}>
                {preview ? 'Use avatar' : 'Keep current'}
              </ThemedText>
            </Pressable>
          </View>
          <Pressable style={styles.dismiss} onPress={() => setOpen(false)}>
            <ThemedText type="link">Cancel</ThemedText>
          </Pressable>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  avatar: {
    width: 140,
    height: 140,
    borderRadius: 80,
    borderWidth: 1,
    borderColor: '#d0d5dd',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: 12,
  },
  avatarDisabled: {
    opacity: 0.5,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    fontWeight: '600',
  },
  avatarBadge: {
    position: 'absolute',
    bottom: 10,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: '#11181C',
    borderRadius: 999,
  },
  avatarBadgeText: {
    color: '#fff',
    fontSize: 12,
  },
  cropLabel: {
    position: 'absolute',
    top: 12,
    backgroundColor: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    fontSize: 12,
  },
  sheet: {
    flex: 1,
    padding: 24,
    gap: 16,
  },
  sheetTitle: {
    marginBottom: 4,
  },
  choices: {
    gap: 12,
  },
  choice: {
    width: 110,
    height: 110,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  choiceSelected: {
    borderColor: '#0a7ea4',
  },
  choiceImage: {
    width: '100%',
    height: '100%',
  },
  sectionLabel: {
    fontWeight: '600',
    marginTop: 12,
  },
  cropRow: {
    flexDirection: 'row',
    gap: 8,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#d0d5dd',
  },
  pillSelected: {
    backgroundColor: '#0a7ea4',
    borderColor: '#0a7ea4',
  },
  pillSelectedText: {
    color: '#fff',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  primary: {
    backgroundColor: '#11181C',
  },
  secondary: {
    borderWidth: 1,
    borderColor: '#d0d5dd',
  },
  primaryText: {
    color: '#fff',
    fontWeight: '600',
  },
  secondaryText: {
    fontWeight: '600',
  },
  dismiss: {
    alignSelf: 'center',
    marginTop: 16,
  },
});
