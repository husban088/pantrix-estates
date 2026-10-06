import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { api, userAuth } from "../api";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  bio: string;
  createdAt: string;
  updatedAt: string;
}

export interface SignupData {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

interface Ctx {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => void;
  setUser: (u: User | null) => void;
}

const AuthContext = createContext<Ctx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(!!userAuth.get());

  // Page khulte hi agar token saved hai to profile load karo
  useEffect(() => {
    if (!userAuth.get()) {
      setLoading(false);
      return;
    }
    api
      .get<User>("/me")
      .then(setUser)
      .catch(() => {
        userAuth.clear();
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const r = await api.post<{ token: string; user: User }>(
      "/auth/user-login",
      { email, password },
    );
    userAuth.set(r.token);
    setUser(r.user);
  }, []);

  const signup = useCallback(async (data: SignupData) => {
    const r = await api.post<{ token: string; user: User }>(
      "/auth/signup",
      data,
    );
    userAuth.set(r.token);
    setUser(r.user);
  }, []);

  const logout = useCallback(() => {
    userAuth.clear();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, signup, logout, setUser }),
    [user, loading, login, signup, logout],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const c = useContext(AuthContext);
  if (!c) throw new Error("useAuth must be used inside AuthProvider");
  return c;
}
