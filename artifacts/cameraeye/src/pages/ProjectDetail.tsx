import { useEffect, useRef } from 'react';
import { useRoute, Link } from 'wouter';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { PageTransition } from '@/components/PageTransition';
import { useProject, useProjects } from '@/lib/content';
import { useDocumentTitle } from '@/hooks/use-document-title';
import NotFound from '@/pages/not-found';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export default function ProjectDetail() {
  const [, params] = useRoute('/projects/:slug');
  const slug = params?.slug ?? '';
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: projects = [] } = useProjects();
  const { data: project, isLoading } = useProject(slug);

  useDocumentTitle(project?.title);

  const projectIndex = projects.findIndex(p => p.slug === slug);

  useEffect(() => {
    window.scrollTo(0, 0);

    // Parallax effect on images
    const ctx = gsap.context(() => {
      const images = gsap.utils.toArray<HTMLElement>('.project-image-container');
      images.forEach((container) => {
        const img = container.querySelector('img');
        if (img) {
          gsap.to(img, {
            yPercent: 20,
            ease: 'none',
            scrollTrigger: {
              trigger: container,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          });
        }
      });
    }, containerRef);

    return () => ctx.revert();
  }, [project?.slug]);

  if (isLoading) {
    return (
      <PageTransition className="min-h-screen flex items-center justify-center">
        <span className="text-white/40 text-xs uppercase tracking-[0.3em]">Loading</span>
      </PageTransition>
    );
  }

  if (!project) {
    return <NotFound />;
  }

  const prevProject = projectIndex > 0 ? projects[projectIndex - 1] : null;
  const nextProject =
    projectIndex >= 0 && projectIndex < projects.length - 1
      ? projects[projectIndex + 1]
      : null;

  return (
    <PageTransition className="bg-background text-foreground pt-32 pb-24" >
      <div ref={containerRef}>
        {/* Meta Block */}
        <div className="px-6 md:px-12 max-w-[1800px] mx-auto mb-24 grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif tracking-tight font-light leading-none mb-8">
              {project.title}
            </h1>
            <p className="text-lg md:text-xl font-serif max-w-2xl text-white/80 leading-relaxed">
              {project.description}
            </p>
          </div>

          <div className="lg:col-span-4 flex flex-col gap-6 text-sm">
            <div className="border-t border-white/10 pt-4 flex justify-between">
              <span className="uppercase tracking-[0.2em] text-white/50 text-xs">Client</span>
              <span className="font-serif text-base">{project.client || 'Self-Initiated'}</span>
            </div>
            <div className="border-t border-white/10 pt-4 flex justify-between">
              <span className="uppercase tracking-[0.2em] text-white/50 text-xs">Year</span>
              <span className="font-serif text-base">{project.year}</span>
            </div>
            <div className="border-t border-white/10 pt-4 flex justify-between">
              <span className="uppercase tracking-[0.2em] text-white/50 text-xs">Category</span>
              <span className="font-serif text-base capitalize">{project.category}</span>
            </div>
          </div>
        </div>

        {/* Images Sequence */}
        <div className="flex flex-col gap-12 md:gap-24 w-full max-w-[2000px] mx-auto px-4 md:px-0">
          {project.imageUrls.map((url, i) => (
            <div
              key={i}
              className={`project-image-container relative overflow-hidden bg-muted ${
                i % 2 === 0 ? 'w-full md:w-[85%] aspect-[16/9] md:ml-auto' : 'w-full md:w-[70%] aspect-[3/4] md:mx-auto'
              }`}
            >
              <img
                src={url}
                alt={`${project.title} - Image ${i + 1}`}
                className="w-full h-[120%] object-cover absolute top-[-10%] left-0"
              />
            </div>
          ))}
        </div>

        {/* Navigation */}
        <div className="px-6 md:px-12 max-w-[1800px] mx-auto mt-32 border-t border-white/10 pt-16 flex flex-col md:flex-row justify-between items-center gap-8">
          {prevProject ? (
            <Link href={`/projects/${prevProject.slug}`} className="group flex flex-col items-start gap-2 hover:opacity-70 transition-opacity w-full md:w-auto" data-testid="link-prev-project">
              <span className="text-xs uppercase tracking-[0.2em] text-white/50 flex items-center gap-2">
                <ArrowLeft className="w-3 h-3" /> Previous
              </span>
              <span className="font-serif text-2xl md:text-3xl">{prevProject.title}</span>
            </Link>
          ) : <div className="w-full md:w-auto" />}

          <Link href="/projects" className="uppercase text-xs tracking-[0.2em] hover:opacity-70 border border-white/20 px-6 py-3 rounded-none" data-testid="link-back-gallery">
            Index
          </Link>

          {nextProject ? (
            <Link href={`/projects/${nextProject.slug}`} className="group flex flex-col items-end gap-2 hover:opacity-70 transition-opacity w-full md:w-auto text-right" data-testid="link-next-project">
              <span className="text-xs uppercase tracking-[0.2em] text-white/50 flex items-center gap-2">
                Next <ArrowRight className="w-3 h-3" />
              </span>
              <span className="font-serif text-2xl md:text-3xl">{nextProject.title}</span>
            </Link>
          ) : <div className="w-full md:w-auto" />}
        </div>
      </div>
    </PageTransition>
  );
}
