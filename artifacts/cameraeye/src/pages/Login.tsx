import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { PageTransition } from '@/components/PageTransition';
import { Seo } from '@/components/Seo';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

const inputClass =
  'w-full bg-transparent border-0 border-b border-border rounded-none px-0 py-3 text-base focus:outline-none focus:border-foreground text-foreground font-serif placeholder:text-muted-foreground/40';

export default function Login() {
  const { login } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pending, setPending] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    try {
      await login(email.trim(), password);
      setLocation('/account');
    } catch {
      toast({
        title: 'Login failed',
        description: 'Invalid email or password.',
        variant: 'destructive',
      });
    } finally {
      setPending(false);
    }
  };

  return (
    <PageTransition className="mx-auto flex min-h-screen max-w-[420px] flex-col justify-center px-6 pb-24 pt-32">
      <Seo title="Log in" path="/login" />
      <h1 className="mb-10 font-serif text-5xl font-light tracking-tight">Log in</h1>
      <form onSubmit={submit} className="flex flex-col gap-8">
        <div>
          <label className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-muted-foreground" htmlFor="login-email">
            Email
          </label>
          <input
            id="login-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            data-testid="input-login-email"
          />
        </div>
        <div>
          <label className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-muted-foreground" htmlFor="login-password">
            Password
          </label>
          <input
            id="login-password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
            data-testid="input-login-password"
          />
        </div>
        <Button
          type="submit"
          disabled={pending}
          className="w-full rounded-none bg-primary py-6 text-xs font-semibold uppercase tracking-[0.2em] text-primary-foreground hover:opacity-85"
          data-testid="button-login"
        >
          {pending ? 'Logging in…' : 'Log in'}
        </Button>
      </form>
      <p className="mt-8 text-sm text-muted-foreground">
        No account yet?{' '}
        <Link href="/register" className="border-b border-border pb-0.5 text-foreground" data-testid="link-register">
          Create one
        </Link>
      </p>
    </PageTransition>
  );
}
