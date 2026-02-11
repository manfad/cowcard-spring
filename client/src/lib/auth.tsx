import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import axios from "axios";
import { authApi } from "./api";
import { queryClient } from "./query";
import type { WhoAmI } from "./types";

interface AuthContextType {
  user: WhoAmI | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    phone: string,
    password: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  refetch: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<WhoAmI | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const res = await authApi.whoami();
      if (res.data.success && res.data.data) {
        setUser(res.data.data);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = async (identifier: string, password: string) => {
    try {
      const res = await authApi.login({ identifier, password });
      if (res.data.success) {
        queryClient.clear();
        await fetchUser();
      } else {
        throw new Error(res.data.message ?? "Login failed");
      }
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        throw new Error(err.response.data.message);
      }
      throw err;
    }
  };

  const register = async (
    name: string,
    email: string,
    phone: string,
    password: string
  ) => {
    try {
      const res = await authApi.register({ name, email, phone, password });
      if (!res.data.success) {
        throw new Error(res.data.message ?? "Registration failed");
      }
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        throw new Error(err.response.data.message);
      }
      throw err;
    }
  };

  const logout = async () => {
    await authApi.logout();
    queryClient.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refetch: fetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
