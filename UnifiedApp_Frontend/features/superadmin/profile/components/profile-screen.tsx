import { Image } from 'expo-image';
import { ReactNode, useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { ThemedText } from '@/components/superadmin/themed-text';
import { ThemedView } from '@/components/superadmin/themed-view';
import { OTP_SUCCESS_CODE } from '@/features/profile/constants';
import { ProfileEditSheet } from '@/features/profile/components/profile-edit-sheet';
import { useProfile } from '@/features/profile/profile-context';

const authLabels: Record<string, string> = {
  email: 'Email',
  phone: 'Phone / OTP',
  guest: 'Guest converted',
};

export function ProfileScreen() {
  const {
    profile,
    verifyEmail,
    cancelEmailRequest,
    verifyPhone,
    cancelPhoneRequest,
    busy,
  } = useProfile();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [verifyingEmail, setVerifyingEmail] = useState(false);
  const [verifyingPhone, setVerifyingPhone] = useState(false);

  const authMethodLabel = useMemo(() => authLabels[profile.authMethod], [profile.authMethod]);

  const avatarContent = profile.avatar ? (
    <Image
      source={{ uri: profile.avatar }}
      style={[styles.avatarImage, { transform: [{ scale: profile.avatarCrop ?? 1 }] }]}
    />
  ) : (
    <ThemedText style={styles.avatarInitials}>{profile.name.slice(0, 2).toUpperCase()}</ThemedText>
  );

  const handleEmailVerify = async () => {
    setVerifyingEmail(true);
    try {
      await verifyEmail();
    } finally {
      setVerifyingEmail(false);
    }
  };

  const handlePhoneVerify = async () => {
    setOtpError('');
    setVerifyingPhone(true);
    try {
      const success = await verifyPhone(otp);
      if (!success) {
        setOtpError(`Use the demo OTP ${OTP_SUCCESS_CODE}.`);
        return;
      }
      setOtp('');
    } finally {
      setVerifyingPhone(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <View style={styles.avatar}>{avatarContent}</View>
          <ThemedText type="title">{profile.name}</ThemedText>
          <ThemedText style={styles.headerSub}>{profile.email.value}</ThemedText>
          <View style={styles.authBadge}>
            <ThemedText style={styles.authBadgeText}>{authMethodLabel}</ThemedText>
          </View>
          <Pressable style={styles.editButton} onPress={() => setSheetOpen(true)}>
            <ThemedText style={styles.editButtonText}>Edit profile</ThemedText>
          </Pressable>
        </View>

        <Section title="Contact">
          <Field label="Email" value={profile.email.value}>
            <StatusPill status={profile.email.status} />
            {profile.email.pendingValue ? (
              <ThemedText style={styles.pendingText}>
                Pending verification: {profile.email.pendingValue}
              </ThemedText>
            ) : (
              <ThemedText style={styles.helper}>
                Last verified{' '}
                {profile.email.lastVerifiedAt
                  ? new Date(profile.email.lastVerifiedAt).toLocaleDateString()
                  : 'N/A'}
              </ThemedText>
            )}
            {profile.email.pendingValue ? (
              <View style={styles.inlineActions}>
                <Pressable
                  style={[styles.smallButton, styles.primary]}
                  onPress={handleEmailVerify}
                  disabled={verifyingEmail || busy.email}>
                  <ThemedText style={styles.primaryText}>
                    {verifyingEmail || busy.email ? 'Verifying…' : 'Mark verified'}
                  </ThemedText>
                </Pressable>
                <Pressable style={[styles.smallButton, styles.secondary]} onPress={cancelEmailRequest}>
                  <ThemedText style={styles.secondaryText}>Cancel change</ThemedText>
                </Pressable>
              </View>
            ) : null}
          </Field>

          <Field label="Phone" value={profile.phone.value}>
            <StatusPill status={profile.phone.status} />
            {profile.phone.pendingValue ? (
              <>
                <ThemedText style={styles.pendingText}>
                  OTP sent to {profile.phone.pendingValue}
                </ThemedText>
                <TextInput
                  style={styles.otpInput}
                  value={otp}
                  onChangeText={setOtp}
                  placeholder="Enter 6-digit OTP"
                  keyboardType="number-pad"
                  maxLength={6}
                />
                {otpError ? <ThemedText style={styles.error}>{otpError}</ThemedText> : null}
                <View style={styles.inlineActions}>
                  <Pressable
                    style={[styles.smallButton, styles.primary]}
                    onPress={handlePhoneVerify}
                    disabled={verifyingPhone || busy.phone}>
                    <ThemedText style={styles.primaryText}>
                      {verifyingPhone || busy.phone ? 'Checking…' : 'Verify OTP'}
                    </ThemedText>
                  </Pressable>
                  <Pressable style={[styles.smallButton, styles.secondary]} onPress={cancelPhoneRequest}>
                    <ThemedText style={styles.secondaryText}>Cancel change</ThemedText>
                  </Pressable>
                </View>
              </>
            ) : (
              <ThemedText style={styles.helper}>
                Last verified{' '}
                {profile.phone.lastVerifiedAt
                  ? new Date(profile.phone.lastVerifiedAt).toLocaleDateString()
                  : 'N/A'}
              </ThemedText>
            )}
          </Field>
        </Section>

        <Section title="Preferences">
          <Field label="Country" value={profile.country} />
          <Field label="Marketing opt-in" value={profile.marketingOptIn ? 'Enabled' : 'Disabled'}>
            <View style={[styles.optBadge, profile.marketingOptIn ? styles.optOn : styles.optOff]}>
              <ThemedText style={styles.optBadgeText}>
                {profile.marketingOptIn ? 'Subscribed' : 'Opted out'}
              </ThemedText>
            </View>
          </Field>
        </Section>
      </ScrollView>

      <ProfileEditSheet visible={sheetOpen} onClose={() => setSheetOpen(false)} />
    </ThemedView>
  );
}

const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <View style={styles.section}>
    <ThemedText style={styles.sectionTitle}>{title}</ThemedText>
    <View style={styles.card}>{children}</View>
  </View>
);

const Field = ({ label, value, children }: { label: string; value: string; children?: ReactNode }) => (
  <View style={styles.field}>
    <ThemedText style={styles.label}>{label}</ThemedText>
    <ThemedText style={styles.value}>{value}</ThemedText>
    {children}
  </View>
);

const StatusPill = ({ status }: { status: 'verified' | 'pending' }) => (
  <View style={[styles.statusPill, status === 'verified' ? styles.statusVerified : styles.statusPending]}>
    <ThemedText style={styles.statusText}>
      {status === 'verified' ? 'Verified' : 'Pending verification'}
    </ThemedText>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    padding: 20,
    gap: 24,
  },
  header: {
    alignItems: 'center',
    gap: 8,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 80,
    borderWidth: 2,
    borderColor: '#d0d5dd',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarInitials: {
    fontSize: 32,
    fontWeight: '700',
  },
  headerSub: {
    color: '#687076',
  },
  authBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: '#0a7ea4',
    borderRadius: 999,
    marginTop: 4,
  },
  authBadgeText: {
    color: '#fff',
    fontWeight: '600',
  },
  editButton: {
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#d0d5dd',
  },
  editButtonText: {
    fontWeight: '600',
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  card: {
    borderWidth: 1,
    borderColor: '#eceef0',
    borderRadius: 16,
    padding: 16,
    gap: 16,
  },
  field: {
    gap: 4,
  },
  label: {
    fontWeight: '600',
    color: '#11181C',
  },
  value: {
    fontSize: 16,
  },
  helper: {
    color: '#687076',
    fontSize: 12,
  },
  pendingText: {
    color: '#b54708',
    fontSize: 13,
  },
  error: {
    color: '#b42318',
    fontSize: 13,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  statusVerified: {
    backgroundColor: '#ecfdf3',
  },
  statusPending: {
    backgroundColor: '#fff0d6',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#11181C',
  },
  inlineActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  smallButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  primary: {
    backgroundColor: '#11181C',
  },
  primaryText: {
    color: '#fff',
    fontWeight: '600',
  },
  secondary: {
    borderWidth: 1,
    borderColor: '#d0d5dd',
  },
  secondaryText: {
    fontWeight: '600',
  },
  otpInput: {
    borderWidth: 1,
    borderColor: '#d0d5dd',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 8,
    fontSize: 16,
    letterSpacing: 4,
  },
  optBadge: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  optOn: {
    backgroundColor: '#ecfdf3',
  },
  optOff: {
    backgroundColor: '#f4f4f5',
  },
  optBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
