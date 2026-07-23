import { Link, useLocation } from 'wouter';
import { motion } from 'framer-motion';

export function Navigation() {
  const [location] = useLocation();

  const links = [
    { href: '/', label: 'Index' },
    { href: '/projects', label: 'Work' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' }
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 p-6 mix-blend-difference text-white">
      <nav className="flex justify-between items-center w-full mx-auto uppercase text-[11px] tracking-[0.2em]">
        <Link href="/" className="font-sans hover:opacity-70 transition-opacity" data-testid="link-logo">
          CameraEye
        </Link>
        <div className="flex gap-8">
          {links.map(link => (
            <Link 
              key={link.href} 
              href={link.href}
              className={`relative py-1 ${location === link.href ? 'opacity-100' : 'opacity-50 hover:opacity-100 transition-opacity'}`}
              data-testid={`link-nav-${link.label.toLowerCase()}`}
            >
              {link.label}
              {location === link.href && (
                <motion.div 
                  layoutId="nav-indicator"
                  className="absolute bottom-0 left-0 right-0 h-[1px] bg-white"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
