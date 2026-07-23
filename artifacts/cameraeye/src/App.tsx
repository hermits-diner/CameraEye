import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter, useLocation } from 'wouter';
import { AnimatePresence } from 'framer-motion';

import Home from '@/pages/Home';
import Projects from '@/pages/Projects';
import ProjectDetail from '@/pages/ProjectDetail';
import About from '@/pages/About';
import Contact from '@/pages/Contact';
import { Navigation } from '@/components/Navigation';
import { useSmoothScroll } from '@/hooks/use-smooth-scroll';

const queryClient = new QueryClient();

function AnimatedRoutes() {
  const [location] = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Switch location={location} key={location}>
        <Route path="/" component={Home} />
        <Route path="/projects" component={Projects} />
        <Route path="/projects/:slug" component={ProjectDetail} />
        <Route path="/about" component={About} />
        <Route path="/contact" component={Contact} />
        <Route component={NotFound} />
      </Switch>
    </AnimatePresence>
  );
}

function App() {
  useSmoothScroll();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <div className="bg-background min-h-screen text-foreground selection:bg-white/30 selection:text-white">
            <Navigation />
            <AnimatedRoutes />
          </div>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
