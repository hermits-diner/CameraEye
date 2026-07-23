import { useRef, useEffect } from 'react';
import { Link } from 'wouter';
import gsap from 'gsap';
import { PageTransition } from '@/components/PageTransition';
import { useProjects } from '@/lib/content';
import { useDocumentTitle } from '@/hooks/use-document-title';
import { ArrowRight } from 'lucide-react';

export default function Home() {
  useDocumentTitle();
  const containerRef = useRef<HTMLDivElement>(null);
  const filmstripRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  const { data: projects = [] } = useProjects();
  const featuredProjects = projects.filter(p => p.featured);

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
      if (filmstripRef.current && sections.length > 1) {
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
      <div ref={containerRef} className="bg-background text-foreground relative">
        {/* Hero Section */}
        <section className="h-screen w-full flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img
              src={projects[0]?.coverImageUrl}
              alt="Hero background"
              className="w-full h-full object-cover opacity-30 object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />
          </div>
          <h1 
            ref={titleRef}
            className="text-6xl md:text-8xl lg:text-[10rem] font-serif tracking-tight z-10 font-light"
          >
            CameraEye
          </h1>
          <p className="mt-8 text-sm uppercase tracking-[0.3em] z-10 opacity-70 font-sans">
            Selected Works
          </p>
        </section>

        {/* Horizontal Film Strip */}
        <section ref={filmstripRef} className="h-screen w-full flex items-center overflow-hidden bg-background">
          <div className="flex w-max items-center h-[70vh] pl-[10vw]">
            {featuredProjects.map((project) => (
              <div 
                key={project.id} 
                className="film-item w-[70vw] md:w-[50vw] lg:w-[40vw] h-full flex-shrink-0 mr-[10vw] relative group"
              >
                <Link href={`/projects/${project.slug}`} className="block w-full h-full relative" data-testid={`link-project-${project.slug}`}>
                  <div className="w-full h-full overflow-hidden">
                    <img 
                      src={project.coverImageUrl} 
                      alt={project.title}
                      className="w-full h-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-105"
                    />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <h2 className="text-3xl font-serif">{project.title}</h2>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-xs uppercase tracking-widest text-white/70">{project.category}</span>
                      <span className="text-xs text-white/50">{project.year}</span>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
            <div className="film-item w-[30vw] flex-shrink-0 flex flex-col justify-center items-start px-12">
              <h3 className="text-4xl font-serif mb-6">Explore the full archive</h3>
              <Link href="/projects" className="flex items-center gap-4 uppercase text-xs tracking-widest hover:text-white/70 transition-colors">
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
