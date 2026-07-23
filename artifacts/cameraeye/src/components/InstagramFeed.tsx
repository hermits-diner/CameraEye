import { Instagram, ArrowUpRight } from 'lucide-react';
import { OptimizedImage } from './OptimizedImage';

interface InstagramPost {
  id: string;
  imageUrl: string;
  caption: string;
  likes: number;
  link: string;
}

const INSTAGRAM_POSTS: InstagramPost[] = [
  {
    id: '1',
    imageUrl: '/images/editorial-1.jpg',
    caption: 'Darkness and light in Tokyo. Shot on Leica M6 with Kodak Tri-X 400. #35mm #streetphotography',
    likes: 1420,
    link: 'https://instagram.com',
  },
  {
    id: '2',
    imageUrl: '/images/portrait-1.jpg',
    caption: 'Quiet hours. Window light portraiture on Hasselblad 500C/M. #mediumformat',
    likes: 2105,
    link: 'https://instagram.com',
  },
  {
    id: '3',
    imageUrl: '/images/urban-1.jpg',
    caption: 'Brutalist structures at dusk. #architecture #monochrome',
    likes: 1890,
    link: 'https://instagram.com',
  },
  {
    id: '4',
    imageUrl: '/images/still-1.jpg',
    caption: 'Form & Void study IV. Minimal light exploration. #minimalism',
    likes: 980,
    link: 'https://instagram.com',
  },
];

export function InstagramFeed() {
  return (
    <section className="my-24 border-t border-white/10 pt-16 px-6 md:px-12 max-w-[1800px] mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-white/50 mb-2">
            <Instagram className="w-4 h-4 text-pink-400" />
            <span>Journal / Social</span>
          </div>
          <h2 className="font-serif text-3xl md:text-4xl font-light">Recent Dispatches</h2>
        </div>

        <a
          href="https://instagram.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 uppercase text-xs tracking-[0.2em] hover:opacity-70 border border-white/20 px-4 py-2"
        >
          <span>@cameraeye.art</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </a>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {INSTAGRAM_POSTS.map((post) => (
          <a
            key={post.id}
            href={post.link}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative block aspect-square overflow-hidden bg-zinc-900 border border-white/10"
          >
            <OptimizedImage
              src={post.imageUrl}
              alt={post.caption}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end text-white text-xs">
              <p className="line-clamp-2 text-white/80 font-serif mb-2">{post.caption}</p>
              <div className="flex items-center gap-1 text-[11px] font-mono text-pink-300">
                <Instagram className="w-3 h-3" />
                <span>{post.likes.toLocaleString()} likes</span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
