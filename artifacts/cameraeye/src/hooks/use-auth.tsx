import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  getGetMeQueryKey,
  login as loginRequest,
  logout as logoutRequest,
  register as registerRequest,
  useGetMe,
  type User,
} from '@workspace/api-client-react';

interface AuthContextValue {
  user: User | null;
  /** True while the initial session lookup is in flight. */
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/** Session-cookie based auth state, backed by GET /api/auth/me. */
export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const meQuery = useGetMe({
    query: {
      queryKey: getGetMeQueryKey(),
      retry: false,
      staleTime: 5 * 60 * 1000,
      // A 401 (or unreachable API) simply means "not logged in".
      refetchOnWindowFocus: false,
    },
    request: { credentials: 'include' },
  });

  const setUser = useCallback(
    (user: User) => {
      queryClient.setQueryData(getGetMeQueryKey(), { user });
    },
    [queryClient],
  );

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await loginRequest({ email, password }, { credentials: 'include' });
      setUser(res.user);
      return res.user;
    },
    [setUser],
  );

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const res = await registerRequest(
        { name, email, password },
        { credentials: 'include' },
      );
      setUser(res.user);
      return res.user;
    },
    [setUser],
  );

  const logout = useCallback(async () => {
    await logoutRequest({ credentials: 'include' });
    queryClient.setQueryData(getGetMeQueryKey(), null);
    await queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
  }, [queryClient]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: meQuery.data?.user ?? null,
      isLoading: meQuery.isLoading,
      login,
      register,
      logout,
    }),
    [meQuery.data, meQuery.isLoading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
