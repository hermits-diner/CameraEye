import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { AnimatePresence, motion } from 'framer-motion';
import { Heart, Menu, User, X } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuth } from '@/hooks/use-auth';
import { useWishlist } from '@/hooks/use-wishlist';

const LINKS = [
  { href: '/', label: 'Index' },
  { href: '/projects', label: 'Work' },
  { href: '/shop', label: 'Shop' },
  { href: '/map', label: 'Map' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export function Navigation() {
  const [location] = useLocation();
  const { user } = useAuth();
  const { count } = useWishlist();
  const [menuOpen, setMenuOpen] = useState(false);

  const accountHref = user ? '/account' : '/login';

  return (
    <>
      <header className="fixed left-0 right-0 top-0 z-50 p-6 text-white mix-blend-difference">
        <nav className="mx-auto flex w-full items-center justify-between text-[11px] uppercase tracking-[0.2em]">
          <Link href="/" className="font-sans transition-opacity hover:opacity-70" data-testid="link-logo">
            CameraEye
          </Link>

          {/* Desktop links */}
          <div className="hidden items-center gap-8 md:flex">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`relative py-1 ${
                  location === link.href
                    ? 'opacity-100'
                    : 'opacity-50 transition-opacity hover:opacity-100'
                }`}
                data-testid={`link-nav-${link.label.toLowerCase()}`}
              >
                {link.label}
                {location === link.href && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute bottom-0 left-0 right-0 h-[1px] bg-white"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-5">
            <Link
              href="/account?tab=wishlist"
              className="relative opacity-70 transition-opacity hover:opacity-100"
              aria-label={`Wishlist (${count})`}
              data-testid="link-wishlist"
            >
              <Heart className="h-4 w-4" />
              {count > 0 && (
                <span className="absolute -right-2 -top-2 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-white px-0.5 text-[8px] font-semibold text-black">
                  {count}
                </span>
              )}
            </Link>
            <Link
              href={accountHref}
              className="opacity-70 transition-opacity hover:opacity-100"
              aria-label={user ? 'Account' : 'Log in'}
              data-testid="link-account"
            >
              <User className="h-4 w-4" />
            </Link>
            <ThemeToggle />
            <button
              type="button"
              className="opacity-70 transition-opacity hover:opacity-100 md:hidden"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              data-testid="button-menu-open"
            >
              <Menu className="h-4 w-4" />
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-0 z-[90] flex flex-col bg-background text-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="flex items-center justify-between p-6">
              <span className="text-[11px] uppercase tracking-[0.2em]">CameraEye</span>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
                data-testid="button-menu-close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex flex-1 flex-col items-start justify-center gap-6 px-8">
              {LINKS.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className={`font-serif text-4xl ${
                      location === link.href ? 'text-foreground' : 'text-muted-foreground'
                    }`}
                    data-testid={`link-mobile-${link.label.toLowerCase()}`}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * LINKS.length }}
              >
                <Link
                  href={accountHref}
                  onClick={() => setMenuOpen(false)}
                  className="font-serif text-4xl text-muted-foreground"
                >
                  {user ? 'Account' : 'Log in'}
                </Link>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
