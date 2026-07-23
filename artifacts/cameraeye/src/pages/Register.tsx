import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { PageTransition } from '@/components/PageTransition';
import { Seo } from '@/components/Seo';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { ApiError } from '@workspace/api-client-react';

const inputClass =
  'w-full bg-transparent border-0 border-b border-border rounded-none px-0 py-3 text-base focus:outline-none focus:border-foreground text-foreground font-serif placeholder:text-muted-foreground/40';

export default function Register() {
  const { register } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pending, setPending] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast({
        title: 'Password too short',
        description: 'Please use at least 8 characters.',
        variant: 'destructive',
      });
      return;
    }
    setPending(true);
    try {
      await register(name.trim(), email.trim(), password);
      setLocation('/account');
    } catch (err) {
      toast({
        title: 'Registration failed',
        description:
          err instanceof ApiError && err.status === 409
            ? 'This email is already registered.'
            : 'Please try again in a moment.',
        variant: 'destructive',
      });
    } finally {
      setPending(false);
    }
  };

  return (
    <PageTransition className="mx-auto flex min-h-screen max-w-[420px] flex-col justify-center px-6 pb-24 pt-32">
      <Seo title="Create account" path="/register" />
      <h1 className="mb-10 font-serif text-5xl font-light tracking-tight">Create account</h1>
      <form onSubmit={submit} className="flex flex-col gap-8">
        <div>
          <label className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-muted-foreground" htmlFor="register-name">
            Name
          </label>
          <input
            id="register-name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
            data-testid="input-register-name"
          />
        </div>
        <div>
          <label className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-muted-foreground" htmlFor="register-email">
            Email
          </label>
          <input
            id="register-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            data-testid="input-register-email"
          />
        </div>
        <div>
          <label className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-muted-foreground" htmlFor="register-password">
            Password
          </label>
          <input
            id="register-password"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
            data-testid="input-register-password"
          />
          <p className="mt-2 text-[11px] text-muted-foreground">At least 8 characters.</p>
        </div>
        <Button
          type="submit"
          disabled={pending}
          className="w-full rounded-none bg-primary py-6 text-xs font-semibold uppercase tracking-[0.2em] text-primary-foreground hover:opacity-85"
          data-testid="button-register"
        >
          {pending ? 'Creating account…' : 'Create account'}
        </Button>
      </form>
      <p className="mt-8 text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/login" className="border-b border-border pb-0.5 text-foreground" data-testid="link-login">
          Log in
        </Link>
      </p>
    </PageTransition>
  );
}
