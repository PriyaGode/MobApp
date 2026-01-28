export type UserRecord = {
  id: number;
  phoneE164: string;
  name: string;
  email?: string;
  password?: string;
  createdAt: number;
};

let users: UserRecord[] = [
  {
    id: 1,
    phoneE164: "+14155550100",
    name: "User One",
    email: "user1@example.com",
    password: "123456",
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 30
  },
  {
    id: 2,
    phoneE164: "+919876543210",
    name: "User Two",
    email: "user2@example.com",
    password: "123456",
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 5
  }
];

let nextId = users.length + 1;

export function validateCredentials(email: string, password: string): UserRecord | undefined {
  return users.find(user => user.email === email && user.password === password);
}

export function findUserByPhone(phoneE164: string): UserRecord | undefined {
  return users.find(user => user.phoneE164 === phoneE164);
}

export function isPhoneRegistered(phoneE164: string): boolean {
  return !!findUserByPhone(phoneE164);
}

export function addUser(profile: { phoneE164: string; name: string; email?: string }): UserRecord {
  const existing = findUserByPhone(profile.phoneE164);
  if (existing) {
    return existing;
  }

  const newUser: UserRecord = {
    id: nextId++,
    phoneE164: profile.phoneE164,
    name: profile.name,
    email: profile.email,
    createdAt: Date.now()
  };
  users = [...users, newUser];
  return newUser;
}

export function upsertUserProfile(phoneE164: string, updates: { name: string; email?: string }): UserRecord {
  const existing = findUserByPhone(phoneE164);
  if (!existing) {
    return addUser({ phoneE164, ...updates });
  }

  const updated: UserRecord = { ...existing, ...updates };
  users = users.map(user => (user.id === existing.id ? updated : user));
  return updated;
}

export function listRegisteredPhones(): string[] {
  return users.map(user => user.phoneE164);
}
