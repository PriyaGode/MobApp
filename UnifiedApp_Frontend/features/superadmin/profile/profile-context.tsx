import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

import { OTP_SUCCESS_CODE } from '@/features/profile/constants';

export type AuthMethod = 'email' | 'phone' | 'guest';

type VerificationStatus = 'verified' | 'pending';

type ContactVerification = {
  value: string;
  status: VerificationStatus;
  pendingValue?: string;
  lastVerifiedAt?: string;
};

type PhoneVerification = ContactVerification & {
  otpLastRequestedAt?: number;
};

export type Profile = {
  name: string;
  country: string;
  marketingOptIn: boolean;
  avatar?: string;
  avatarCrop?: number;
  authMethod: AuthMethod;
  email: ContactVerification;
  phone: PhoneVerification;
};

type BusyMap = {
  profile: boolean;
  email: boolean;
  phone: boolean;
};

type ProfileContextValue = {
  profile: Profile;
  busy: BusyMap;
  updateProfile: (payload: Partial<Omit<Profile, 'email' | 'phone'>>) => Promise<void>;
  requestEmailChange: (nextEmail: string) => Promise<void>;
  verifyEmail: () => Promise<void>;
  cancelEmailRequest: () => void;
  requestPhoneChange: (nextPhone: string) => Promise<void>;
  verifyPhone: (otp: string) => Promise<boolean>;
  cancelPhoneRequest: () => void;
  clearAvatar: () => Promise<void>;
};

const ProfileContext = createContext<ProfileContextValue | null>(null);

const initialProfile: Profile = {
  name: 'Ami Rivera',
  country: 'United States',
  marketingOptIn: true,
  avatar:
    'https://images.unsplash.com/photo-1521579971123-1192931a1452?auto=format&fit=facearea&w=320&h=320&q=80',
  avatarCrop: 1,
  authMethod: 'email',
  email: {
    value: 'ami.rivera@example.com',
    status: 'verified',
    lastVerifiedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
  },
  phone: {
    value: '+1 555 010 2099',
    status: 'verified',
    lastVerifiedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    otpLastRequestedAt: undefined,
  },
};

const simulateLatency = async () => new Promise((resolve) => setTimeout(resolve, 450));

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile>(initialProfile);
  const [busy, setBusy] = useState<BusyMap>({ profile: false, email: false, phone: false });

  const withBusy = useCallback(async (key: keyof BusyMap, action: () => Promise<void>) => {
    setBusy((prev) => ({ ...prev, [key]: true }));
    try {
      await action();
    } finally {
      setBusy((prev) => ({ ...prev, [key]: false }));
    }
  }, []);

  const updateProfile = useCallback(
    async (payload: Partial<Omit<Profile, 'email' | 'phone'>>) => {
      await withBusy('profile', async () => {
        setProfile((prev) => ({ ...prev, ...payload }));
        await simulateLatency();
      });
    },
    [withBusy]
  );

  const requestEmailChange = useCallback(
    async (nextEmail: string) => {
      const trimmed = nextEmail.trim();
      if (!trimmed) {
        return;
      }

      await withBusy('email', async () => {
        setProfile((prev) => ({
          ...prev,
          email: {
            ...prev.email,
            pendingValue: trimmed,
            status: 'pending',
          },
        }));
        await simulateLatency();
      });
    },
    [withBusy]
  );

  const verifyEmail = useCallback(async () => {
    await withBusy('email', async () => {
      setProfile((prev) => ({
        ...prev,
        email: {
          value: prev.email.pendingValue ?? prev.email.value,
          pendingValue: undefined,
          status: 'verified',
          lastVerifiedAt: new Date().toISOString(),
        },
      }));
      await simulateLatency();
    });
  }, [withBusy]);

  const cancelEmailRequest = useCallback(() => {
    setProfile((prev) => ({
      ...prev,
      email: {
        ...prev.email,
        pendingValue: undefined,
        status: prev.email.pendingValue ? 'verified' : prev.email.status,
      },
    }));
  }, []);

  const requestPhoneChange = useCallback(
    async (nextPhone: string) => {
      const trimmed = nextPhone.trim();
      if (!trimmed) {
        return;
      }

      await withBusy('phone', async () => {
        setProfile((prev) => ({
          ...prev,
          phone: {
            ...prev.phone,
            pendingValue: trimmed,
            status: 'pending',
            otpLastRequestedAt: Date.now(),
          },
        }));
        await simulateLatency();
      });
    },
    [withBusy]
  );

  const verifyPhone = useCallback(
    async (otp: string) => {
      let verified = false;
      await withBusy('phone', async () => {
        await simulateLatency();
        verified = otp.trim() === OTP_SUCCESS_CODE;
        if (verified) {
          setProfile((prev) => ({
            ...prev,
            phone: {
              value: prev.phone.pendingValue ?? prev.phone.value,
              pendingValue: undefined,
              status: 'verified',
              lastVerifiedAt: new Date().toISOString(),
              otpLastRequestedAt: undefined,
            },
          }));
        }
      });

      return verified;
    },
    [withBusy]
  );

  const cancelPhoneRequest = useCallback(() => {
    setProfile((prev) => ({
      ...prev,
      phone: {
        ...prev.phone,
        pendingValue: undefined,
        status: prev.phone.pendingValue ? 'verified' : prev.phone.status,
        otpLastRequestedAt: undefined,
      },
    }));
  }, []);

  const clearAvatar = useCallback(async () => {
    await updateProfile({ avatar: undefined, avatarCrop: 1 });
  }, [updateProfile]);

  const value = useMemo(
    () => ({
      profile,
      busy,
      updateProfile,
      requestEmailChange,
      verifyEmail,
      cancelEmailRequest,
      requestPhoneChange,
      verifyPhone,
      cancelPhoneRequest,
      clearAvatar,
    }),
    [
      profile,
      busy,
      updateProfile,
      requestEmailChange,
      verifyEmail,
      cancelEmailRequest,
      requestPhoneChange,
      verifyPhone,
      cancelPhoneRequest,
      clearAvatar,
    ]
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }

  return ctx;
}
