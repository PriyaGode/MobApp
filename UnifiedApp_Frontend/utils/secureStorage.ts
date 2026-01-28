// Minimal secure storage abstraction (non-persistent placeholder)
// Replace with expo-secure-store or AsyncStorage for production.

let authToken: string | null = null;
let userData: any | null = null;

export const secureStorage = {
  async setAuthToken(token: string) { authToken = token; },
  async getAuthToken() { return authToken; },
  async setUserData(data: any) { userData = data; },
  async getUserData() { return userData; },
  async clear() { authToken = null; userData = null; }
};
