import { useMemo } from 'react';
import { PageTransition } from '@/components/PageTransition';
import { MapView, type MapPin } from '@/components/MapView';
import { Seo } from '@/components/Seo';
import { useProjects } from '@/lib/content/adapter';
import { urlFor } from '@/lib/sanity/image';

export default function MapPage() {
  const { projects } = useProjects();

  const pins = useMemo<MapPin[]>(
    () =>
      projects.flatMap((project) =>
        project.images
          .filter((image) => image.location)
          .map((image) => ({
            lat: image.location!.lat,
            lng: image.location!.lng,
            label: image.location!.label,
            title: project.title,
            href: `/projects/${project.slug}`,
            imageUrl:
              image.source.kind === 'url'
                ? image.source.src
                : urlFor(image.source.image).width(320).auto('format').url(),
          })),
      ),
    [projects],
  );

  return (
    <PageTransition className="mx-auto max-w-[1800px] px-6 pb-24 pt-32 md:px-12">
      <Seo
        title="Locations"
        description="Where the photographs were taken — shooting locations of Walden View's street work, mapped. 촬영 위치 지도."
        path="/map"
      />
      <div className="mb-12">
        <h1 className="mb-4 font-serif text-5xl font-light tracking-tight md:text-7xl">
          Locations
        </h1>
        <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
          Where the frames were made · 사진이 만들어진 곳
        </p>
      </div>

      {pins.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          아직 위치가 등록된 사진이 없습니다 · No geotagged photographs yet.
        </p>
      ) : (
        <MapView pins={pins} className="h-[70vh] w-full border border-border" />
      )}

      <p className="mt-6 text-[11px] text-muted-foreground">
        Locations are approximate — street work is pinned to the neighborhood,
        not the exact frame.
      </p>
    </PageTransition>
  );
}
