import { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  View,
} from 'react-native';

import { ThemedText } from '@/components/superadmin/themed-text';
import { AvatarPicker } from '@/features/profile/components/avatar-picker';
import { COUNTRIES } from '@/features/profile/constants';
import { Profile, useProfile } from '@/features/profile/profile-context';

type ProfileEditSheetProps = {
  visible: boolean;
  onClose: () => void;
};

export function ProfileEditSheet({ visible, onClose }: ProfileEditSheetProps) {
  const { profile, updateProfile, requestEmailChange, requestPhoneChange, busy } = useProfile();
  const [form, setForm] = useState(() => buildState(profile));
  const [saving, setSaving] = useState(false);
  const [countryPickerOpen, setCountryPickerOpen] = useState(false);

  useEffect(() => {
    if (visible) {
      setForm(buildState(profile));
    }
  }, [visible, profile]);

  const isDirty = useMemo(() => {
    return (
      form.name !== profile.name ||
      form.email !== profile.email.value ||
      form.phone !== profile.phone.value ||
      form.country !== profile.country ||
      form.marketingOptIn !== profile.marketingOptIn ||
      form.avatar !== profile.avatar ||
      form.avatarCrop !== profile.avatarCrop
    );
  }, [form, profile]);

  const handleChange = (key: keyof typeof form, value: string | boolean | number | undefined) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!isDirty) {
      onClose();
      return;
    }

    setSaving(true);
    try {
      const updatePayload: Partial<Omit<Profile, 'email' | 'phone'>> = {};
      if (form.name !== profile.name) updatePayload.name = form.name;
      if (form.country !== profile.country) updatePayload.country = form.country;
      if (form.marketingOptIn !== profile.marketingOptIn)
        updatePayload.marketingOptIn = form.marketingOptIn;
      if (form.avatar !== profile.avatar || form.avatarCrop !== profile.avatarCrop) {
        updatePayload.avatar = form.avatar;
        updatePayload.avatarCrop = form.avatarCrop;
      }
      const work: Promise<unknown>[] = [];
      if (Object.keys(updatePayload).length) {
        work.push(updateProfile(updatePayload));
      }
      if (form.email !== profile.email.value) {
        work.push(requestEmailChange(form.email));
      }
      if (form.phone !== profile.phone.value) {
        work.push(requestPhoneChange(form.phone));
      }

      await Promise.all(work);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const renderCountry = ({ item }: { item: string }) => (
    <Pressable
      style={styles.countryOption}
      onPress={() => {
        handleChange('country', item);
        setCountryPickerOpen(false);
      }}>
      <ThemedText style={styles.countryText}>{item}</ThemedText>
    </Pressable>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.sheet}>
          <ThemedText type="title">Edit profile</ThemedText>
          <ThemedText style={styles.subtitle}>
            Keep your details accurate so verification steps stay quick.
          </ThemedText>

          <AvatarPicker
            value={form.avatar}
            crop={form.avatarCrop}
            onChange={(uri, crop) => {
              handleChange('avatar', uri);
              handleChange('avatarCrop', crop ?? 1);
            }}
          />

          <View style={styles.fieldGroup}>
            <Label text="Name" />
            <TextInput
              style={styles.input}
              value={form.name}
              onChangeText={(text) => handleChange('name', text)}
              placeholder="Full name"
              autoCapitalize="words"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Label text="Email" helper="Changing email forces a new verification link." />
            <TextInput
              style={styles.input}
              value={form.email}
              onChangeText={(text) => handleChange('email', text)}
              placeholder="Email address"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Label text="Phone" helper="Phone edits require a new OTP once you save." />
            <TextInput
              style={styles.input}
              value={form.phone}
              onChangeText={(text) => handleChange('phone', text)}
              placeholder="+1 555 555 5555"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Label text="Country" helper="We use this for compliance messaging." />
            <Pressable style={styles.countryInput} onPress={() => setCountryPickerOpen(true)}>
              <ThemedText>{form.country}</ThemedText>
            </Pressable>
          </View>

          <View style={[styles.fieldGroup, styles.switchRow]}>
            <View>
              <Label text="Marketing opt-in" />
              <ThemedText style={styles.helper}>
                {form.marketingOptIn ? 'You get launch news + promos.' : 'Opt back in anytime.'}
              </ThemedText>
            </View>
            <Switch
              value={form.marketingOptIn}
              onValueChange={(val) => handleChange('marketingOptIn', val)}
            />
          </View>

          <ThemedText style={styles.disclaimer}>
            Saving triggers optimistic updates so you immediately see your latest info while
            verification runs securely in the background.
          </ThemedText>
        </ScrollView>

        <View style={styles.footer}>
          <Pressable style={[styles.button, styles.secondary]} onPress={onClose}>
            <ThemedText style={styles.secondaryText}>Cancel</ThemedText>
          </Pressable>
          <Pressable
            style={[styles.button, styles.primary, (!isDirty || saving) && styles.buttonDisabled]}
            disabled={!isDirty || saving || busy.profile}
            onPress={handleSave}>
            <ThemedText style={styles.primaryText}>
              {saving || busy.profile ? 'Saving…' : 'Save changes'}
            </ThemedText>
          </Pressable>
        </View>
      </KeyboardAvoidingView>

      <Modal visible={countryPickerOpen} animationType="slide" onRequestClose={() => setCountryPickerOpen(false)}>
        <View style={styles.countrySheet}>
          <ThemedText type="title">Select country</ThemedText>
          <FlatList
            data={COUNTRIES}
            renderItem={renderCountry}
            keyExtractor={(item) => item}
          />
          <Pressable style={styles.dismiss} onPress={() => setCountryPickerOpen(false)}>
            <ThemedText type="link">Close</ThemedText>
          </Pressable>
        </View>
      </Modal>
    </Modal>
  );
}

const Label = ({ text, helper }: { text: string; helper?: string }) => (
  <>
    <ThemedText style={styles.label}>{text}</ThemedText>
    {helper ? <ThemedText style={styles.helper}>{helper}</ThemedText> : null}
  </>
);

const buildState = (profile: Profile) => ({
  name: profile.name,
  email: profile.email.value,
  phone: profile.phone.value,
  country: profile.country,
  marketingOptIn: profile.marketingOptIn,
  avatar: profile.avatar,
  avatarCrop: profile.avatarCrop ?? 1,
});

const styles = StyleSheet.create({
  flex: { flex: 1 },
  sheet: {
    padding: 24,
    gap: 16,
  },
  subtitle: {
    color: '#687076',
  },
  fieldGroup: {
    gap: 6,
  },
  label: {
    fontWeight: '600',
  },
  helper: {
    color: '#687076',
    fontSize: 13,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d0d5dd',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  countryInput: {
    borderWidth: 1,
    borderColor: '#d0d5dd',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  disclaimer: {
    fontSize: 12,
    color: '#687076',
  },
  footer: {
    padding: 20,
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
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
  buttonDisabled: {
    opacity: 0.5,
  },
  countrySheet: {
    flex: 1,
    padding: 24,
    gap: 16,
  },
  countryOption: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  countryText: {
    fontSize: 16,
  },
  dismiss: {
    alignSelf: 'center',
    marginTop: 12,
  },
});
