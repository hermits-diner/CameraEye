import { PageTransition } from '@/components/PageTransition';
import { useAbout } from '@/lib/content';
import { useDocumentTitle } from '@/hooks/use-document-title';

const FALLBACK_EMAIL = 'studio@cameraeye.com';

export default function About() {
  useDocumentTitle('About');
  const { data: about } = useAbout();
  const bio = about?.bio ?? '';
  const portraitUrl = about?.portraitUrl ?? '';
  const email = about?.contactEmail ?? FALLBACK_EMAIL;

  return (
    <PageTransition className="min-h-screen flex items-center pt-24 pb-12 px-6 md:px-12 max-w-[1800px] mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-24 w-full h-full items-center">
        {/* Image */}
        <div className="order-2 lg:order-1 h-[60vh] lg:h-[80vh] w-full bg-muted relative overflow-hidden group">
          <img
            src={portraitUrl}
            alt="Portrait"
            className="w-full h-full object-cover grayscale transition-transform duration-[1.5s] group-hover:scale-105"
          />
        </div>

        {/* Text */}
        <div className="order-1 lg:order-2 flex flex-col justify-center">
          <h1 className="text-4xl md:text-6xl font-serif tracking-tight font-light mb-12">
            The space between <br/><span className="text-white/40 italic">light and dark</span>.
          </h1>
          <p className="font-serif text-xl md:text-2xl text-white/80 leading-relaxed max-w-xl mb-12">
            {bio}
          </p>

          <div className="flex flex-col gap-4 text-sm uppercase tracking-[0.2em]">
            <a href={`mailto:${email}`} className="hover:text-white/70 transition-colors w-fit pb-1 border-b border-white/20">
              {email}
            </a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-white/70 transition-colors w-fit pb-1 border-b border-white/20">
              Instagram
            </a>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
