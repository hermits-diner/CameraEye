import React, { useState } from 'react';
import { X, UserCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

export function AuthModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { user, login, logout } = useAuth();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const { toast } = useToast();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    login(email, name);
    toast({
      title: 'Signed In Successfully',
      description: `Welcome back, ${name || email}!`,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-sm bg-zinc-900 border border-white/20 p-8 rounded-none text-white shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {user ? (
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <UserCheck className="w-10 h-10 text-emerald-400" />
            </div>
            <h2 className="font-serif text-2xl font-light">Collector Profile</h2>
            <div className="text-xs text-white/70 font-mono space-y-1">
              <div>Name: <span className="text-white">{user.name}</span></div>
              <div>Email: <span className="text-white">{user.email}</span></div>
            </div>
            <button
              onClick={() => {
                logout();
                onClose();
              }}
              className="w-full border border-red-500/40 text-red-400 uppercase text-xs tracking-[0.2em] py-2.5 hover:bg-red-950/40 transition-colors"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <div>
            <h2 className="font-serif text-2xl font-light mb-2 text-center">Collector Login</h2>
            <p className="text-xs text-white/50 text-center mb-6">
              Access your order history, wishlist, and digital downloads.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-white/50 uppercase tracking-widest text-[10px] mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="Junghoon Oh"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white/5 border border-white/20 p-2.5 text-white placeholder:text-white/30 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-white/50 uppercase tracking-widest text-[10px] mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="collector@cameraeye.art"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/20 p-2.5 text-white placeholder:text-white/30 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-white text-black font-sans uppercase text-xs tracking-[0.2em] py-3 hover:bg-white/90 transition-colors font-bold"
              >
                Sign In / Register
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
