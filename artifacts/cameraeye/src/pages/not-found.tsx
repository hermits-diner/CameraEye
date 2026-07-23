import { Link } from 'wouter';
import { PageTransition } from '@/components/PageTransition';
import { useDocumentTitle } from '@/hooks/use-document-title';

export default function NotFound() {
  useDocumentTitle('Page not found');
  return (
    <PageTransition className="bg-background text-foreground min-h-screen w-full flex flex-col items-center justify-center px-6 text-center">
      <p className="text-xs uppercase tracking-[0.3em] text-white/40 mb-6">Error 404</p>
      <h1 className="text-6xl md:text-8xl font-serif font-light tracking-tight mb-8">
        Page not found
      </h1>
      <p className="text-white/60 font-serif text-lg max-w-md mb-12">
        The frame you're looking for has drifted out of view.
      </p>
      <div className="flex gap-8 text-xs uppercase tracking-[0.2em]">
        <Link href="/" className="pb-1 border-b border-white/20 hover:text-white/70 transition-colors" data-testid="link-home">
          Home
        </Link>
        <Link href="/projects" className="pb-1 border-b border-white/20 hover:text-white/70 transition-colors" data-testid="link-archive">
          Archive
        </Link>
      </div>
    </PageTransition>
  );
}
