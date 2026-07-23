import React, { createContext, useContext, useEffect, useState } from 'react';

interface WishlistContextType {
  wishlistSlugs: string[];
  toggleWishlist: (slug: string) => void;
  isInWishlist: (slug: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlistSlugs, setWishlistSlugs] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('cameraeye_wishlist');
      return saved ? JSON.parse(saved) : ['shadows-and-light'];
    } catch {
      return ['shadows-and-light'];
    }
  });

  useEffect(() => {
    localStorage.setItem('cameraeye_wishlist', JSON.stringify(wishlistSlugs));
  }, [wishlistSlugs]);

  const toggleWishlist = (slug: string) => {
    setWishlistSlugs((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };

  const isInWishlist = (slug: string) => wishlistSlugs.includes(slug);

  return (
    <WishlistContext.Provider value={{ wishlistSlugs, toggleWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
