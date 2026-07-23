import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormMessage, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { PageTransition } from '@/components/PageTransition';

const contactSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address'),
  message: z.string().min(10, 'Message is required'),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export default function Contact() {
  const { toast } = useToast();
  
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      message: '',
    },
  });

  const onSubmit = (data: ContactFormValues) => {
    toast({
      title: 'Message Sent',
      description: 'Thank you for reaching out. We will get back to you shortly.',
    });
    form.reset();
  };

  return (
    <PageTransition className="min-h-screen pt-32 pb-24 px-6 md:px-12 max-w-[1200px] mx-auto flex items-center">
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24">
        <div>
          <h1 className="text-5xl md:text-7xl font-serif tracking-tight font-light mb-8">
            Inquiries
          </h1>
          <p className="text-white/60 font-serif text-lg leading-relaxed max-w-md mb-12">
            For commissions, print sales, or general inquiries, please fill out the form or reach out directly.
          </p>
          <div className="flex flex-col gap-6 text-sm uppercase tracking-[0.2em] text-white/50">
            <div>
              <span className="block mb-2 text-white/30 text-xs">Email</span>
              <a href="mailto:studio@cameraeye.com" className="text-white hover:opacity-70 transition-opacity">studio@cameraeye.com</a>
            </div>
            <div>
              <span className="block mb-2 text-white/30 text-xs">Studio</span>
              <span className="text-white">100 Bowery, New York<br/>NY 10013</span>
            </div>
          </div>
        </div>

        <div className="w-full max-w-md">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-12">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="uppercase text-xs tracking-[0.2em] text-white/50 mb-2 block">Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Jane Doe" 
                        {...field} 
                        className="bg-transparent border-0 border-b border-white/20 rounded-none px-0 py-4 text-lg focus-visible:ring-0 focus-visible:border-white text-white font-serif placeholder:text-white/20"
                        data-testid="input-name"
                      />
                    </FormControl>
                    <FormMessage className="text-xs mt-2" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="uppercase text-xs tracking-[0.2em] text-white/50 mb-2 block">Email</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="jane@example.com" 
                        {...field} 
                        className="bg-transparent border-0 border-b border-white/20 rounded-none px-0 py-4 text-lg focus-visible:ring-0 focus-visible:border-white text-white font-serif placeholder:text-white/20"
                        data-testid="input-email"
                      />
                    </FormControl>
                    <FormMessage className="text-xs mt-2" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="uppercase text-xs tracking-[0.2em] text-white/50 mb-2 block">Message</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Tell me about your project..." 
                        {...field} 
                        className="bg-transparent border-0 border-b border-white/20 rounded-none px-0 py-4 text-lg focus-visible:ring-0 focus-visible:border-white text-white font-serif placeholder:text-white/20 min-h-[150px] resize-none"
                        data-testid="input-message"
                      />
                    </FormControl>
                    <FormMessage className="text-xs mt-2" />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full bg-white text-black hover:bg-white/80 rounded-none uppercase tracking-[0.2em] text-xs py-6 font-semibold"
                data-testid="button-submit"
              >
                Send Message
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </PageTransition>
  );
}
