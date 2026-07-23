import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  getWishlist as getWishlistRequest,
  updateWishlist as updateWishlistRequest,
} from '@workspace/api-client-react';
import { useAuth } from '@/hooks/use-auth';

const STORAGE_KEY = 'cameraeye:wishlist';

interface WishlistContextValue {
  productIds: string[];
  has: (productId: string) => boolean;
  toggle: (productId: string) => void;
  count: number;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

function readLocal(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string') : [];
  } catch {
    return [];
  }
}

/**
 * Wishlist that works for everyone: guests keep it in localStorage; when a
 * user logs in the local list is merged with the server copy and kept in
 * sync from then on.
 */
export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [productIds, setProductIds] = useState<string[]>(readLocal);
  const syncedForUser = useRef<string | null>(null);

  // Persist locally on every change (also serves as the guest store).
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(productIds));
    } catch {
      /* storage unavailable — in-memory only */
    }
  }, [productIds]);

  // On login: merge local + server lists once, then push the union.
  useEffect(() => {
    if (!user) {
      syncedForUser.current = null;
      return;
    }
    if (syncedForUser.current === user.id) return;
    syncedForUser.current = user.id;
    void (async () => {
      try {
        const server = await getWishlistRequest({ credentials: 'include' });
        const merged = [...new Set([...server.productIds, ...readLocal()])];
        setProductIds(merged);
        await updateWishlistRequest({ productIds: merged }, { credentials: 'include' });
      } catch {
        /* API unavailable — keep local list */
      }
    })();
  }, [user]);

  const toggle = useCallback(
    (productId: string) => {
      setProductIds((prev) => {
        const next = prev.includes(productId)
          ? prev.filter((id) => id !== productId)
          : [...prev, productId];
        if (user) {
          void updateWishlistRequest(
            { productIds: next },
            { credentials: 'include' },
          ).catch(() => {
            /* keep local copy on failure */
          });
        }
        return next;
      });
    },
    [user],
  );

  const value = useMemo<WishlistContextValue>(
    () => ({
      productIds,
      has: (id) => productIds.includes(id),
      toggle,
      count: productIds.length,
    }),
    [productIds, toggle],
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist(): WishlistContextValue {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
}
