import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Heart, ShoppingBag, User, Sun, Moon, Mail, Menu, X } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';
import { AuthModal } from './auth/AuthModal';
import { NewsletterModal } from './NewsletterModal';

export function Navigation() {
  const [location] = useLocation();
  const { wishlistSlugs } = useWishlist();
  const { user, orders } = useAuth();

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isNewsletterOpen, setIsNewsletterOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const links = [
    { href: '/', label: 'Index' },
    { href: '/projects', label: 'Work' },
    { href: '/orders', label: `Orders ${orders.length > 0 ? `(${orders.length})` : ''}` },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 p-6 mix-blend-difference text-white">
        <nav className="flex justify-between items-center w-full mx-auto uppercase text-[11px] tracking-[0.2em]">
          {/* Logo */}
          <Link href="/" className="font-sans font-bold text-sm hover:opacity-70 transition-opacity" data-testid="link-logo">
            CameraEye
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex gap-8 items-center">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`relative py-1 ${
                  location === link.href ? 'opacity-100' : 'opacity-60 hover:opacity-100 transition-opacity'
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

            {/* Newsletter Button */}
            <button
              onClick={() => setIsNewsletterOpen(true)}
              className="opacity-70 hover:opacity-100 transition-opacity flex items-center gap-1.5"
              title="Subscribe to Collector Newsletter"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Newsletter</span>
            </button>
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-4">
            {/* Wishlist Link */}
            <Link
              href="/projects"
              className="relative p-1 hover:opacity-70 transition-opacity flex items-center gap-1"
              title="Saved Wishlist"
            >
              <Heart className="w-4 h-4 text-rose-400 fill-rose-400/30" />
              {wishlistSlugs.length > 0 && (
                <span className="text-[10px] font-mono opacity-80">({wishlistSlugs.length})</span>
              )}
            </Link>

            {/* Auth Profile */}
            <button
              onClick={() => setIsAuthOpen(true)}
              className="p-1 hover:opacity-70 transition-opacity flex items-center gap-1"
              title={user ? `Logged in as ${user.name}` : 'Login / Register'}
            >
              <User className={`w-4 h-4 ${user ? 'text-emerald-400' : 'text-white/70'}`} />
            </button>

            {/* Theme Switcher */}
            <ThemeToggle />

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-1 text-white"
              aria-label="Toggle Mobile Menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </nav>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden mt-4 pt-4 border-t border-white/20 bg-black/90 p-6 flex flex-col gap-4 text-white text-xs uppercase tracking-widest"
          >
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-2 border-b border-white/10"
              >
                {link.label}
              </Link>
            ))}
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                setIsNewsletterOpen(true);
              }}
              className="py-2 text-left text-emerald-300 flex items-center gap-2"
            >
              <Mail className="w-4 h-4" />
              <span>Newsletter Subscription</span>
            </button>
          </motion.div>
        )}
      </header>

      {/* Modals */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <NewsletterModal isOpen={isNewsletterOpen} onClose={() => setIsNewsletterOpen(false)} />
    </>
  );
}
