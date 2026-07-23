import { useEffect, useRef, useState } from 'react';
import { useRoute, Link } from 'wouter';
import gsap from 'gsap';
import { PageTransition } from '@/components/PageTransition';
import { useProject, useProjects } from '@/lib/content';
import { useSEO } from '@/hooks/use-seo';
import NotFound from '@/pages/not-found';
import { ArrowLeft, ArrowRight, Heart, Camera, Film, Layers, ShoppingBag, Sparkles } from 'lucide-react';
import { PhotoLocationMap } from '@/components/PhotoLocationMap';
import { CheckoutModal } from '@/components/commerce/CheckoutModal';
import { InstagramFeed } from '@/components/InstagramFeed';
import { OptimizedImage } from '@/components/OptimizedImage';
import { useWishlist } from '@/context/WishlistContext';

export default function ProjectDetail() {
  const [, params] = useRoute('/projects/:slug');
  const slug = params?.slug ?? '';
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: projects = [] } = useProjects();
  const { data: project, isLoading } = useProject(slug);

  const { isInWishlist, toggleWishlist } = useWishlist();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [activeLightboxImg, setActiveLightboxImg] = useState<string | null>(null);

  useSEO({
    title: project ? `${project.title} (${project.filmFormat})` : 'Project Detail',
    description: project?.description,
    ogImage: project?.coverImageUrl,
  });

  const projectIndex = projects.findIndex((p) => p.slug === slug);
  const isWishlisted = project ? isInWishlist(project.slug) : false;

  useEffect(() => {
    window.scrollTo(0, 0);

    const ctx = gsap.context(() => {
      const images = gsap.utils.toArray<HTMLElement>('.project-image-container');
      images.forEach((container) => {
        const img = container.querySelector('img');
        if (img) {
          gsap.to(img, {
            yPercent: 15,
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
        <span className="text-white/40 text-xs uppercase tracking-[0.3em] animate-pulse">Loading Series</span>
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
    <PageTransition className="bg-background text-foreground pt-32 pb-24">
      <div ref={containerRef}>
        {/* Meta Block Header */}
        <div className="px-6 md:px-12 max-w-[1800px] mx-auto mb-16 grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8">
            <div className="flex flex-wrap items-center gap-3 mb-6">
              {/* Format Tag Badge */}
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-400/40 text-emerald-300 text-xs font-mono rounded-full uppercase tracking-wider">
                <Film className="w-3.5 h-3.5" />
                {project.filmFormat}
              </span>

              {/* Category Badge */}
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 border border-white/20 text-white/80 text-xs font-mono rounded-full uppercase tracking-wider">
                <Layers className="w-3.5 h-3.5" />
                {project.category}
              </span>

              {/* Wishlist Button */}
              <button
                onClick={() => toggleWishlist(project.slug)}
                className={`inline-flex items-center gap-1.5 px-4 py-1 border transition-all text-xs font-mono rounded-full uppercase tracking-wider ${
                  isWishlisted
                    ? 'bg-rose-500/20 border-rose-400 text-rose-300'
                    : 'border-white/20 hover:border-white/40 text-white/70'
                }`}
                title="Save to Wishlist"
              >
                <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-rose-400 text-rose-400' : ''}`} />
                <span>{isWishlisted ? 'Saved in Wishlist' : 'Add to Wishlist'}</span>
              </button>
            </div>

            <h1 className="text-4xl md:text-7xl lg:text-8xl font-serif tracking-tight font-light leading-none mb-8">
              {project.title}
            </h1>
            <p className="text-lg md:text-xl font-serif max-w-2xl text-white/80 leading-relaxed">
              {project.description}
            </p>
          </div>

          {/* Limited Edition Print Acquisition Box */}
          <div className="lg:col-span-4 flex flex-col justify-between border border-white/20 bg-zinc-900/60 p-6 backdrop-blur-md">
            <div>
              <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-3">
                <span className="text-[10px] uppercase tracking-[0.25em] text-white/50 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  Limited Edition Print
                </span>
                <span className="text-xs font-mono text-emerald-400 font-bold">
                  {project.edition.remainingStock > 0
                    ? `${project.edition.remainingStock}/${project.edition.totalLimit} Left`
                    : 'Sold Out'}
                </span>
              </div>

              {/* Remaining Stock Progress Bar */}
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mb-4">
                <div
                  className="h-full bg-emerald-400 transition-all duration-500"
                  style={{
                    width: `${(project.edition.remainingStock / project.edition.totalLimit) * 100}%`,
                  }}
                />
              </div>

              <div className="space-y-2 text-xs font-mono text-white/70 mb-6">
                <div>• Hand-numbered & signed artist proof</div>
                <div>• Hahnemühle Fine Art Pigment Paper</div>
                <div>• Includes Instant Digital Master Asset</div>
              </div>
            </div>

            <button
              onClick={() => setIsCheckoutOpen(true)}
              className="w-full bg-white text-black uppercase text-xs tracking-[0.2em] py-3.5 font-bold hover:bg-white/90 transition-colors flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Acquire Print / Digital File</span>
            </button>
          </div>
        </div>

        {/* Behind The Scenes & Specs Banner */}
        <div className="px-6 md:px-12 max-w-[1800px] mx-auto mb-20">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
            {/* Story */}
            <div className="md:col-span-7 border-b md:border-b-0 md:border-r border-white/10 pb-6 md:pb-0 md:pr-8">
              <h3 className="text-xs uppercase tracking-[0.25em] text-white/50 mb-3 flex items-center gap-2">
                <Camera className="w-4 h-4 text-emerald-400" />
                <span>Behind the Scenes & Series Notes</span>
              </h3>
              <p className="text-sm font-serif text-white/80 leading-relaxed italic">
                "{project.behindTheScenes}"
              </p>
            </div>

            {/* Gear Specs Table */}
            <div className="md:col-span-5 space-y-2 text-xs font-mono">
              <h3 className="text-xs uppercase tracking-[0.25em] text-white/50 mb-3 font-sans">Technical Specifications</h3>
              <div className="flex justify-between border-b border-white/10 pb-1.5">
                <span className="text-white/50">Camera</span>
                <span className="text-white">{project.gear.camera}</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-1.5">
                <span className="text-white/50">Lens</span>
                <span className="text-white">{project.gear.lens}</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-1.5">
                <span className="text-white/50">Film / Sensor</span>
                <span className="text-white">{project.gear.filmStock}</span>
              </div>
              {project.gear.lighting && (
                <div className="flex justify-between">
                  <span className="text-white/50">Lighting</span>
                  <span className="text-white">{project.gear.lighting}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Photo Location Map Section */}
        {project.locations && project.locations.length > 0 && (
          <div className="px-6 md:px-12 max-w-[1800px] mx-auto">
            <PhotoLocationMap locations={project.locations} title={`${project.title} — Shooting Locations`} />
          </div>
        )}

        {/* Image Gallery Sequence with Click to Lightbox */}
        <div className="flex flex-col gap-12 md:gap-24 w-full max-w-[2000px] mx-auto px-4 md:px-0 my-16">
          {project.imageUrls.map((url, i) => (
            <div
              key={i}
              onClick={() => setActiveLightboxImg(url)}
              className={`project-image-container relative overflow-hidden cursor-pointer group ${
                i % 2 === 0
                  ? 'w-full md:w-[85%] aspect-[16/9] md:ml-auto'
                  : 'w-full md:w-[70%] aspect-[3/4] md:mx-auto'
              }`}
            >
              <OptimizedImage
                src={url}
                alt={`${project.title} - Image ${i + 1}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 text-[10px] font-mono text-white/70 opacity-0 group-hover:opacity-100 transition-opacity">
                Click to expand (Mobile Touch Enabled)
              </div>
            </div>
          ))}
        </div>

        {/* Lightbox Modal */}
        {activeLightboxImg && (
          <div
            onClick={() => setActiveLightboxImg(null)}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 cursor-zoom-out backdrop-blur-lg"
          >
            <img
              src={activeLightboxImg}
              alt="Expanded View"
              className="max-w-full max-h-full object-contain shadow-2xl border border-white/10"
            />
          </div>
        )}

        {/* Social Dispatches Feed */}
        <InstagramFeed />

        {/* Navigation to Next/Prev Projects */}
        <div className="px-6 md:px-12 max-w-[1800px] mx-auto mt-24 border-t border-white/10 pt-16 flex flex-col md:flex-row justify-between items-center gap-8">
          {prevProject ? (
            <Link
              href={`/projects/${prevProject.slug}`}
              className="group flex flex-col items-start gap-2 hover:opacity-70 transition-opacity w-full md:w-auto"
              data-testid="link-prev-project"
            >
              <span className="text-xs uppercase tracking-[0.2em] text-white/50 flex items-center gap-2">
                <ArrowLeft className="w-3 h-3" /> Previous
              </span>
              <span className="font-serif text-2xl md:text-3xl">{prevProject.title}</span>
            </Link>
          ) : (
            <div className="w-full md:w-auto" />
          )}

          <Link
            href="/projects"
            className="uppercase text-xs tracking-[0.2em] hover:opacity-70 border border-white/20 px-6 py-3"
            data-testid="link-back-gallery"
          >
            Index
          </Link>

          {nextProject ? (
            <Link
              href={`/projects/${nextProject.slug}`}
              className="group flex flex-col items-end gap-2 hover:opacity-70 transition-opacity w-full md:w-auto text-right"
              data-testid="link-next-project"
            >
              <span className="text-xs uppercase tracking-[0.2em] text-white/50 flex items-center gap-2">
                Next <ArrowRight className="w-3 h-3" />
              </span>
              <span className="font-serif text-2xl md:text-3xl">{nextProject.title}</span>
            </Link>
          ) : (
            <div className="w-full md:w-auto" />
          )}
        </div>
      </div>

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        projectTitle={project.title}
        projectId={project.id}
        coverImageUrl={project.coverImageUrl}
        edition={project.edition}
      />
    </PageTransition>
  );
}
