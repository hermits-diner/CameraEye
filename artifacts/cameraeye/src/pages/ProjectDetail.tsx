import { useEffect, useRef, useState } from 'react';
import { useRoute, Link } from 'wouter';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { PageTransition } from '@/components/PageTransition';
import { OptimizedImage } from '@/components/OptimizedImage';
import { FormatBadge } from '@/components/FormatBadge';
import { Lightbox } from '@/components/Lightbox';
import { MapView, type MapPin } from '@/components/MapView';
import { Seo } from '@/components/Seo';
import NotFound from '@/pages/not-found';
import { useProject } from '@/lib/content/adapter';
import { getProductsForProject } from '@workspace/commerce';
import { urlFor } from '@/lib/sanity/image';
import { formatKRW } from '@/lib/format';
import { ArrowLeft, ArrowRight, MapPin as MapPinIcon } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function ProjectDetail() {
  const [, params] = useRoute('/projects/:slug');
  const containerRef = useRef<HTMLDivElement>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const { project, projects } = useProject(params?.slug);
  const projectIndex = projects.findIndex((p) => p.slug === params?.slug);

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

  if (!project) {
    return <NotFound />;
  }

  const prevProject = projectIndex > 0 ? projects[projectIndex - 1] : null;
  const nextProject =
    projectIndex >= 0 && projectIndex < projects.length - 1
      ? projects[projectIndex + 1]
      : null;

  const relatedProducts = getProductsForProject(project.slug);

  const pins: MapPin[] = project.images
    .filter((image) => image.location)
    .map((image) => ({
      lat: image.location!.lat,
      lng: image.location!.lng,
      label: image.location!.label,
      title: project.title,
      imageUrl:
        image.source.kind === 'url'
          ? image.source.src
          : urlFor(image.source.image).width(320).auto('format').url(),
    }));

  const coverUrl =
    project.cover.kind === 'url'
      ? project.cover.src
      : urlFor(project.cover.image).width(1200).auto('format').url();

  return (
    <PageTransition className="bg-background text-foreground pt-32 pb-24">
      <Seo
        title={project.title}
        description={project.description}
        image={coverUrl}
        path={`/projects/${project.slug}`}
        type="article"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'CreativeWork',
          name: project.title,
          description: project.description,
          creator: { '@type': 'Person', name: 'CameraEye' },
          dateCreated: String(project.year),
        }}
      />
      <div ref={containerRef}>
        {/* Meta Block */}
        <div className="px-6 md:px-12 max-w-[1800px] mx-auto mb-24 grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif tracking-tight font-light leading-none mb-8">
              {project.title}
            </h1>
            <p className="text-lg md:text-xl font-serif max-w-2xl text-foreground/80 leading-relaxed">
              {project.description}
            </p>
          </div>

          <div className="lg:col-span-4 flex flex-col gap-6 text-sm">
            <div className="border-t border-border pt-4 flex justify-between">
              <span className="uppercase tracking-[0.2em] text-muted-foreground text-xs">Client</span>
              <span className="font-serif text-base">{project.client || 'Self-Initiated'}</span>
            </div>
            <div className="border-t border-border pt-4 flex justify-between">
              <span className="uppercase tracking-[0.2em] text-muted-foreground text-xs">Year</span>
              <span className="font-serif text-base">{project.year}</span>
            </div>
            <div className="border-t border-border pt-4 flex justify-between">
              <span className="uppercase tracking-[0.2em] text-muted-foreground text-xs">Category</span>
              <span className="font-serif text-base capitalize">{project.category}</span>
            </div>
            <div className="border-t border-border pt-4 flex justify-between items-center">
              <span className="uppercase tracking-[0.2em] text-muted-foreground text-xs">Format</span>
              <FormatBadge format={project.format} filmStock={project.filmStock} />
            </div>
            {project.camera && (
              <div className="border-t border-border pt-4 flex justify-between">
                <span className="uppercase tracking-[0.2em] text-muted-foreground text-xs">Camera</span>
                <span className="font-serif text-base">{project.camera}</span>
              </div>
            )}
            {project.lenses && project.lenses.length > 0 && (
              <div className="border-t border-border pt-4 flex justify-between">
                <span className="uppercase tracking-[0.2em] text-muted-foreground text-xs">Lenses</span>
                <span className="font-serif text-base text-right">{project.lenses.join(', ')}</span>
              </div>
            )}
          </div>
        </div>

        {/* Images Sequence */}
        <div className="flex flex-col gap-12 md:gap-24 w-full max-w-[2000px] mx-auto px-4 md:px-0">
          {project.images.map((image, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setLightboxIndex(i)}
              className={`project-image-container relative overflow-hidden bg-muted cursor-zoom-in text-left ${
                i % 2 === 0
                  ? 'w-full md:w-[85%] aspect-[16/9] md:ml-auto'
                  : 'w-full md:w-[70%] aspect-[3/4] md:mx-auto'
              }`}
              aria-label={`View ${image.alt} fullscreen`}
              data-testid={`image-project-${i}`}
            >
              <OptimizedImage
                source={image.source}
                alt={image.alt}
                className="absolute inset-0 h-full w-full bg-transparent"
                imgClassName="h-[120%] w-full object-cover absolute top-[-10%] left-0"
                sizes="(min-width: 768px) 85vw, 100vw"
              />
              {image.location && (
                <span className="absolute bottom-4 left-4 z-10 flex items-center gap-1.5 bg-black/60 px-2.5 py-1 text-[10px] uppercase tracking-[0.15em] text-white/90">
                  <MapPinIcon className="h-3 w-3" /> {image.location.label}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Series notes / behind the scenes */}
        {project.story && (
          <div className="px-6 md:px-12 max-w-[1800px] mx-auto mt-32">
            <div className="max-w-2xl">
              <h2 className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-8">
                Series notes
              </h2>
              {project.story.split('\n\n').map((paragraph, i) => (
                <p
                  key={i}
                  className="font-serif text-lg md:text-xl leading-relaxed text-foreground/80 mb-6"
                >
                  {paragraph}
                </p>
              ))}
              {(project.camera || project.filmStock) && (
                <p className="mt-8 text-xs uppercase tracking-[0.15em] text-muted-foreground">
                  {[project.camera, project.filmStock, project.lenses?.join(' / ')]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Shooting locations */}
        {pins.length > 0 && (
          <div className="px-6 md:px-12 max-w-[1800px] mx-auto mt-32">
            <h2 className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-8">
              Shooting locations
            </h2>
            <MapView pins={pins} className="h-[50vh] w-full border border-border" />
          </div>
        )}

        {/* Prints from this series */}
        {relatedProducts.length > 0 && (
          <div className="px-6 md:px-12 max-w-[1800px] mx-auto mt-32">
            <h2 className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-8">
              Available from this series
            </h2>
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
              {relatedProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/shop/${product.slug}`}
                  className="group flex flex-col"
                  data-testid={`link-series-product-${product.slug}`}
                >
                  <div className="aspect-[3/4] overflow-hidden bg-muted">
                    <OptimizedImage
                      source={product.imageUrl}
                      alt={product.title}
                      className="h-full w-full"
                      imgClassName="transition-transform duration-700 group-hover:scale-105"
                      sizes="25vw"
                    />
                  </div>
                  <span className="mt-3 font-serif text-sm leading-tight">{product.title}</span>
                  <span className="mt-1 text-xs text-muted-foreground">
                    {product.type === 'digital'
                      ? formatKRW(product.digital?.price ?? 0)
                      : `from ${formatKRW(Math.min(...(product.sizes ?? []).map((s) => s.price)))}`}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="px-6 md:px-12 max-w-[1800px] mx-auto mt-32 border-t border-border pt-16 flex flex-col md:flex-row justify-between items-center gap-8">
          {prevProject ? (
            <Link
              href={`/projects/${prevProject.slug}`}
              className="group flex flex-col items-start gap-2 hover:opacity-70 transition-opacity w-full md:w-auto"
              data-testid="link-prev-project"
            >
              <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                <ArrowLeft className="w-3 h-3" /> Previous
              </span>
              <span className="font-serif text-2xl md:text-3xl">{prevProject.title}</span>
            </Link>
          ) : (
            <div className="w-full md:w-auto" />
          )}

          <Link
            href="/projects"
            className="uppercase text-xs tracking-[0.2em] hover:opacity-70 border border-border px-6 py-3 rounded-none"
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
              <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                Next <ArrowRight className="w-3 h-3" />
              </span>
              <span className="font-serif text-2xl md:text-3xl">{nextProject.title}</span>
            </Link>
          ) : (
            <div className="w-full md:w-auto" />
          )}
        </div>
      </div>

      <Lightbox
        images={project.images}
        openIndex={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onNavigate={setLightboxIndex}
      />
    </PageTransition>
  );
}
