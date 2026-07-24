import { useMemo, useState } from 'react';
import { Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { PageTransition } from '@/components/PageTransition';
import { OptimizedImage } from '@/components/OptimizedImage';
import { FormatBadge } from '@/components/FormatBadge';
import { Seo } from '@/components/Seo';
import { useProjects } from '@/lib/content/adapter';
import { categoryLabel, type ProjectCategory } from '@/lib/content/types';

export default function Projects() {
  const [activeCategory, setActiveCategory] = useState<ProjectCategory | 'all'>('all');
  const { projects } = useProjects();

  // Filter chips follow the genres actually present in the content, so new
  // categories added in the CMS appear here without a code change.
  const categories = useMemo(() => {
    const present = [...new Set(projects.map((p) => p.category))];
    return [
      { label: 'All', value: 'all' as const },
      ...present.map((value) => ({ label: categoryLabel(value), value })),
    ];
  }, [projects]);

  const filteredProjects =
    activeCategory === 'all'
      ? projects
      : projects.filter((p) => p.category === activeCategory);

  return (
    <PageTransition className="pt-32 pb-24 px-6 md:px-12 max-w-[1800px] mx-auto">
      <Seo
        title="Archive"
        description="Selected street photography series by Walden View — 셀렉티드 시리즈 아카이브."
        path="/projects"
      />
      {/* Header & Filter */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
        <div>
          <h1 className="text-5xl md:text-7xl font-serif tracking-tight font-light mb-4">Archive</h1>
          <p className="text-muted-foreground text-sm uppercase tracking-[0.2em]">
            Selected works · 셀렉티드 시리즈
          </p>
        </div>

        <div className="flex gap-6 overflow-x-auto pb-2 w-full md:w-auto scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
              className={`text-xs uppercase tracking-[0.15em] transition-colors whitespace-nowrap ${
                activeCategory === cat.value
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground/80'
              }`}
              data-testid={`filter-${cat.value}`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
        <AnimatePresence mode="popLayout">
          {filteredProjects.map((project, i) => (
            <motion.div
              key={project.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className={`group relative flex flex-col ${
                i % 3 === 0 ? 'md:mt-16' : ''
              } ${i % 3 === 1 ? 'md:-mt-8' : ''}`}
            >
              <Link
                href={`/projects/${project.slug}`}
                className="block overflow-hidden bg-muted aspect-[3/4]"
                data-testid={`link-gallery-${project.slug}`}
              >
                <OptimizedImage
                  source={project.cover}
                  alt={project.title}
                  className="w-full h-full"
                  imgClassName="transition-transform duration-700 ease-out group-hover:scale-105"
                  sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                />
              </Link>
              <div className="mt-4 flex justify-between items-start gap-4">
                <div>
                  <h3 className="text-xl font-serif">{project.title}</h3>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">
                    {categoryLabel(project.category)}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">{project.year}</span>
              </div>
              <FormatBadge format={project.format} className="mt-3 w-fit" />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </PageTransition>
  );
}
