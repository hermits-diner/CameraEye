import React, { useState } from 'react';
import { Mail, CheckCircle2, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function NewsletterModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
    toast({
      title: 'Subscribed Successfully!',
      description: 'You will receive exclusive print drops and exhibition announcements.',
    });
    setTimeout(() => {
      onClose();
      setSubmitted(false);
      setEmail('');
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-zinc-900 border border-white/20 p-8 rounded-none text-white shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="p-3 bg-white/10 rounded-full mb-4">
            <Mail className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-serif font-light mb-2">Exhibition & Collector Notes</h2>
          <p className="text-xs text-white/60 mb-6 leading-relaxed">
            Subscribe for early access to limited edition prints, private gallery invitations, and behind-the-scenes stories.
          </p>

          {submitted ? (
            <div className="flex items-center gap-2 text-emerald-400 py-4 text-sm font-sans">
              <CheckCircle2 className="w-5 h-5" />
              <span>Welcome to the CamerEye Collector Circle.</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="w-full space-y-4">
              <input
                type="email"
                required
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/20 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-white transition-colors"
              />
              <button
                type="submit"
                className="w-full bg-white text-black font-sans uppercase text-xs tracking-[0.2em] py-3 hover:bg-white/90 transition-colors"
              >
                Join Collectors List
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
