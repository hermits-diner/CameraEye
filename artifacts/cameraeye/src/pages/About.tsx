import { PageTransition } from '@/components/PageTransition';
import { OptimizedImage } from '@/components/OptimizedImage';
import { Seo } from '@/components/Seo';
import { useAboutContent } from '@/lib/content/adapter';

export default function About() {
  const { about } = useAboutContent();

  return (
    <PageTransition className="min-h-screen flex items-center pt-24 pb-12 px-6 md:px-12 max-w-[1800px] mx-auto">
      <Seo
        title="About"
        description={about.bio}
        path="/about"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Person',
          name: 'Walden View',
          jobTitle: 'Street Photographer',
          address: { '@type': 'PostalAddress', addressCountry: 'KR' },
          description: about.bio,
        }}
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-24 w-full h-full items-center">
        {/* Image */}
        <div className="order-2 lg:order-1 h-[60vh] lg:h-[80vh] w-full bg-muted relative overflow-hidden group">
          <OptimizedImage
            source={about.portrait}
            alt="Portrait"
            className="w-full h-full"
            imgClassName="grayscale transition-transform duration-[1.5s] group-hover:scale-105"
            sizes="(min-width: 1024px) 50vw, 100vw"
            priority
          />
        </div>

        {/* Text */}
        <div className="order-1 lg:order-2 flex flex-col justify-center">
          <h1 className="text-4xl md:text-6xl font-serif tracking-tight font-light mb-12">
            Scenes met <br />
            <span className="text-muted-foreground italic">on the street</span>.
          </h1>
          {about.bio.split('\n\n').map((paragraph, i) => (
            <p
              key={i}
              className="font-serif text-lg md:text-xl text-foreground/80 leading-relaxed max-w-xl mb-6 last:mb-8"
            >
              {paragraph}
            </p>
          ))}

          {about.skills && about.skills.length > 0 && (
            <div className="mb-12 flex flex-wrap gap-3">
              {about.skills.map((skill) => (
                <span
                  key={skill}
                  className="border border-border px-3 py-1 text-[10px] uppercase tracking-[0.15em] text-muted-foreground"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}

          <div className="flex flex-col gap-4 text-sm uppercase tracking-[0.2em]">
            {about.contactEmail && (
              <a
                href={`mailto:${about.contactEmail}`}
                className="hover:opacity-70 transition-opacity w-fit pb-1 border-b border-border"
              >
                {about.contactEmail}
              </a>
            )}
            {about.instagramHandle && (
              <a
                href={`https://instagram.com/${about.instagramHandle}`}
                target="_blank"
                rel="noreferrer"
                className="hover:opacity-70 transition-opacity w-fit pb-1 border-b border-border"
              >
                Instagram
              </a>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
