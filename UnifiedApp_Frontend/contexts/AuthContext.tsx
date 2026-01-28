import { createContext, ReactNode, useEffect, useState } from "react";
import { clearToken, getToken } from "../components/auth/tokenStore";

interface User {
  token: string;
  email: string;
  fullName?: string;
  userId?: number;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;

  userToken: string | null;
  setUserToken: (token: string | null) => void;

  logout: () => void;
}

interface LoadingContextType {
  loading: boolean;
  setLoading: (value: boolean) => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},

  userToken: null,
  setUserToken: () => {},

  logout: () => {},
});

export const LoadingContext = createContext<LoadingContextType>({
  loading: false,
  setLoading: () => {},
});

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userToken, setUserToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Load token on startup
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const stored: any = await getToken();
        if (!mounted) return;

        if (stored?.token) {
          setUserToken(stored.token);
          setUser({
            token: stored.token,
            email: stored.email,
            fullName: stored.fullName,
            userId: stored.userId,
            role: stored.role,
          });
        }
      } catch (err) {
        console.error("Error reading token:", err);
      }
    })();

    return () => { mounted = false };
  }, []);

  const logout = async () => {
    setUser(null);
    setUserToken(null);
    await clearToken();
  };

  return (
    <AuthContext.Provider value={{ user, setUser, userToken, setUserToken, logout }}>
      <LoadingContext.Provider value={{ loading, setLoading }}>
        {children}
      </LoadingContext.Provider>
    </AuthContext.Provider>
  );
};
``