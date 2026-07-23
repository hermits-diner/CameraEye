import { useState } from 'react';
import { Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { PageTransition } from '@/components/PageTransition';
import { mockProjects, ProjectCategory } from '@/data/mockData';

const categories: { label: string; value: ProjectCategory | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Editorial', value: 'editorial' },
  { label: 'Portrait', value: 'portrait' },
  { label: 'Campaign', value: 'campaign' },
  { label: 'Personal', value: 'personal' },
];

export default function Projects() {
  const [activeCategory, setActiveCategory] = useState<ProjectCategory | 'all'>('all');

  const filteredProjects = activeCategory === 'all' 
    ? mockProjects 
    : mockProjects.filter(p => p.category === activeCategory);

  return (
    <PageTransition className="pt-32 pb-24 px-6 md:px-12 max-w-[1800px] mx-auto">
      {/* Header & Filter */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
        <div>
          <h1 className="text-5xl md:text-7xl font-serif tracking-tight font-light mb-4">Archive</h1>
          <p className="text-muted-foreground text-sm uppercase tracking-[0.2em]">Selected works 2022–2024</p>
        </div>
        
        <div className="flex gap-6 overflow-x-auto pb-2 w-full md:w-auto scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
              className={`text-xs uppercase tracking-[0.15em] transition-colors whitespace-nowrap ${
                activeCategory === cat.value ? 'text-white' : 'text-white/40 hover:text-white/80'
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
              <Link href={`/projects/${project.slug}`} className="block overflow-hidden bg-muted aspect-[3/4]" data-testid={`link-gallery-${project.slug}`}>
                <img 
                  src={project.coverImageUrl} 
                  alt={project.title}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  loading="lazy"
                />
              </Link>
              <div className="mt-4 flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-serif">{project.title}</h3>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">{project.category}</p>
                </div>
                <span className="text-xs text-muted-foreground">{project.year}</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </PageTransition>
  );
}
