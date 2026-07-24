import { useRef, useEffect } from 'react';
import { Link } from 'wouter';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { PageTransition } from '@/components/PageTransition';
import { OptimizedImage } from '@/components/OptimizedImage';
import { Seo } from '@/components/Seo';
import { useProjects } from '@/lib/content/adapter';
import { categoryLabel } from '@/lib/content/types';
import { ArrowRight } from 'lucide-react';

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const filmstripRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const { projects } = useProjects();
  const featuredProjects = projects.filter((p) => p.featured);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Title fade out on scroll
      gsap.to(titleRef.current, {
        opacity: 0,
        y: -50,
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: '+=500',
          scrub: true,
        },
      });

      // Horizontal scroll for filmstrip
      const sections = gsap.utils.toArray('.film-item');
      if (filmstripRef.current && sections.length > 0) {
        gsap.to(sections, {
          xPercent: -100 * (sections.length - 1),
          ease: 'none',
          scrollTrigger: {
            trigger: filmstripRef.current,
            pin: true,
            scrub: 1,
            snap: 1 / (sections.length - 1),
            end: () => '+=' + filmstripRef.current!.offsetWidth * 2,
          },
        });
      }
    }, containerRef);

    return () => ctx.revert();
  }, [featuredProjects.length]);

  return (
    <PageTransition>
      <Seo
        description="Walden View — street photography from South Korea. 거리에서 마주친 장면들을 기록합니다. Fine art prints and digital editions available."
        path="/"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'Walden View',
          description: 'Street photography portfolio and print shop, South Korea',
        }}
      />
      <div ref={containerRef} className="bg-background text-foreground relative">
        {/* Hero Section */}
        <section className="h-screen w-full flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 z-0">
            {featuredProjects[0] && (
              <OptimizedImage
                source={featuredProjects[0].cover}
                alt="Hero background"
                className="w-full h-full bg-transparent"
                imgClassName="opacity-30 object-center"
                priority
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />
          </div>
          <h1
            ref={titleRef}
            className="text-6xl md:text-8xl lg:text-[9rem] font-serif tracking-tight z-10 font-light"
          >
            Walden View
          </h1>
          <p className="mt-8 text-sm uppercase tracking-[0.3em] z-10 opacity-70 font-sans">
            Street Photography · South Korea
          </p>
          <p className="mt-3 text-xs tracking-[0.2em] z-10 opacity-50 font-sans">
            거리에서 마주친 장면들
          </p>
        </section>

        {/* Horizontal Film Strip */}
        <section
          ref={filmstripRef}
          className="h-screen w-full flex items-center overflow-hidden bg-background"
        >
          <div className="flex w-max items-center h-[70vh] pl-[10vw]">
            {featuredProjects.map((project) => (
              <div
                key={project.id}
                className="film-item w-[70vw] md:w-[50vw] lg:w-[40vw] h-full flex-shrink-0 mr-[10vw] relative group"
              >
                <Link
                  href={`/projects/${project.slug}`}
                  className="block w-full h-full relative"
                  data-testid={`link-project-${project.slug}`}
                >
                  <OptimizedImage
                    source={project.cover}
                    alt={project.title}
                    className="w-full h-full"
                    imgClassName="grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-105"
                    sizes="(min-width: 1024px) 40vw, 70vw"
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <h2 className="text-3xl font-serif text-white">{project.title}</h2>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-xs uppercase tracking-widest text-white/70">
                        {categoryLabel(project.category)}
                      </span>
                      <span className="text-xs text-white/50">{project.year}</span>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
            <div className="film-item w-[30vw] flex-shrink-0 flex flex-col justify-center items-start px-12">
              <h3 className="text-4xl font-serif mb-2">Explore the full archive</h3>
              <p className="text-sm text-muted-foreground mb-6">전체 아카이브 보기</p>
              <Link
                href="/projects"
                className="flex items-center gap-4 uppercase text-xs tracking-widest hover:opacity-70 transition-opacity"
              >
                View all projects <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Footer spacer */}
        <div className="h-[20vh] w-full bg-background" />
      </div>
    </PageTransition>
  );
}
