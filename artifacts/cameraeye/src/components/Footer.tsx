import { useState } from 'react';
import { Link } from 'wouter';
import { ArrowRight, Instagram } from 'lucide-react';
import {
  getGetInstagramFeedQueryKey,
  useGetInstagramFeed,
  useSubscribeNewsletter,
} from '@workspace/api-client-react';
import { useToast } from '@/hooks/use-toast';
import { aboutData } from '@/data/mockData';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function NewsletterForm() {
  const [email, setEmail] = useState('');
  const { toast } = useToast();
  const subscribe = useSubscribeNewsletter({
    mutation: {
      onSuccess: () => {
        toast({
          title: 'Subscribed',
          description: 'Thank you — new work and print releases will land in your inbox.',
        });
        setEmail('');
      },
      onError: () => {
        toast({
          title: 'Subscription failed',
          description: 'Please try again in a moment.',
          variant: 'destructive',
        });
      },
    },
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!EMAIL_RE.test(trimmed)) {
      toast({ title: 'Please enter a valid email address', variant: 'destructive' });
      return;
    }
    subscribe.mutate({ data: { email: trimmed } });
  };

  return (
    <form onSubmit={submit} className="flex w-full max-w-sm items-end gap-2">
      <div className="flex-1">
        <label
          htmlFor="newsletter-email"
          className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-muted-foreground"
        >
          Newsletter
        </label>
        <input
          id="newsletter-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full border-0 border-b border-border bg-transparent px-0 py-2 font-serif text-base text-foreground placeholder:text-muted-foreground/50 focus:border-foreground focus:outline-none"
          data-testid="input-newsletter-email"
        />
      </div>
      <button
        type="submit"
        disabled={subscribe.isPending}
        className="flex items-center gap-2 border border-border px-4 py-2 text-[10px] uppercase tracking-[0.2em] transition-colors hover:border-foreground disabled:opacity-50"
        data-testid="button-newsletter-subscribe"
      >
        Subscribe <ArrowRight className="h-3 w-3" />
      </button>
    </form>
  );
}

function InstagramStrip() {
  const feed = useGetInstagramFeed({
    query: {
      queryKey: getGetInstagramFeedQueryKey(),
      staleTime: 10 * 60 * 1000,
      retry: false,
    },
  });
  const posts = feed.data?.posts ?? [];
  const handle = aboutData.instagramHandle;

  return (
    <div className="flex flex-col gap-4">
      <a
        href={`https://instagram.com/${handle}`}
        target="_blank"
        rel="noreferrer"
        className="flex w-fit items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
        data-testid="link-instagram"
      >
        <Instagram className="h-3.5 w-3.5" /> @{handle}
      </a>
      {posts.length > 0 && (
        <div className="grid grid-cols-4 gap-2 md:grid-cols-8">
          {posts.map((post) => (
            <a
              key={post.id}
              href={post.permalink}
              target="_blank"
              rel="noreferrer"
              className="group relative aspect-square overflow-hidden bg-muted"
            >
              <img
                src={post.mediaUrl}
                alt={post.caption ?? 'Instagram post'}
                loading="lazy"
                className="h-full w-full object-cover grayscale transition-all duration-500 group-hover:grayscale-0"
              />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-border px-6 pb-10 pt-16 md:px-12">
      <div className="mx-auto flex max-w-[1800px] flex-col gap-12">
        <div className="flex flex-col justify-between gap-12 md:flex-row">
          <div className="flex flex-col gap-6">
            <Link href="/" className="font-sans text-xs uppercase tracking-[0.2em]">
              CameraEye
            </Link>
            <p className="max-w-xs font-serif text-sm leading-relaxed text-muted-foreground">
              Photography studio exploring the space between light and dark.
              Fine art prints and digital editions available.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-16 gap-y-2 text-xs uppercase tracking-[0.15em]">
            {[
              { href: '/projects', label: 'Work' },
              { href: '/shop', label: 'Prints' },
              { href: '/map', label: 'Map' },
              { href: '/about', label: 'About' },
              { href: '/contact', label: 'Contact' },
              { href: '/account', label: 'Account' },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="py-1 text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <NewsletterForm />
        </div>

        <InstagramStrip />

        <div className="flex flex-col justify-between gap-2 border-t border-border pt-6 text-[10px] uppercase tracking-[0.15em] text-muted-foreground md:flex-row">
          <span>© {new Date().getFullYear()} CameraEye Studio. All rights reserved.</span>
          <span>New York · Seoul</span>
        </div>
      </div>
    </footer>
  );
}
