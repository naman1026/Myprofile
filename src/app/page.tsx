// @ts-nocheck
// TODO: Fix TS errors
'use client';

import React, { useState, useTransition, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, User, Briefcase, Lightbulb, GraduationCap, Mail, Github, Linkedin, ArrowDown, ArrowRight, Send, Loader2, Phone, MapPin, Link as LinkIcon, ServerIcon } from 'lucide-react';
import { TypeAnimation } from 'react-type-animation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { sendEmailAction } from '@/actions/send-email';
import { getPortfolioData } from '@/actions/portfolio-actions'; // Import the server action to fetch data
import type { PortfolioData } from '@/lib/portfolio-schema'; // Import the type

// Define section types
type Section = 'home' | 'about' | 'experience' | 'projects' | 'education' | 'contact';

// Section Order for Navigation
const sectionOrder: Section[] = ['home', 'about', 'experience', 'projects', 'education', 'contact'];

// Props interface for sections needing navigation or data
interface SectionProps {
  data: PortfolioData;
  setActiveSection: (section: Section) => void;
}

interface ContactSectionProps {
    data: PortfolioData;
}

// Contact Form Schema
const contactFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  message: z.string().min(10, { message: "Message must be at least 10 characters." }),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;


// --- Component Definitions ---

const Navbar = ({ activeSection, setActiveSection }: { activeSection: Section; setActiveSection: (section: Section) => void }) => {
  const navItems: { id: Section; label: string; icon: React.ElementType }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'about', label: 'About', icon: User },
    { id: 'experience', label: 'Experience', icon: Briefcase },
    { id: 'projects', label: 'Projects', icon: Lightbulb },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'contact', label: 'Contact', icon: Mail },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-10 bg-card bg-opacity-80 backdrop-blur-sm border-b border-border shadow-md">
      <div className="container mx-auto px-4 h-16 flex justify-center items-center">
        <div className="flex space-x-1 sm:space-x-2 md:space-x-4">
          {navItems.map((item) => (
            <Button
              key={item.id}
              variant={activeSection === item.id ? 'secondary' : 'ghost'}
              size="sm"
              className={`transition-all duration-300 hover:bg-accent hover:text-accent-foreground ${
                activeSection === item.id ? 'text-accent-foreground bg-accent' : ''
              }`}
              onClick={() => setActiveSection(item.id)}
            >
              <item.icon className="mr-0 md:mr-2 h-4 w-4" />
              <span className="hidden md:inline">{item.label}</span>
            </Button>
          ))}
        </div>
      </div>
    </nav>
  );
};

const SectionWrapper: React.FC<{ children: React.ReactNode; sectionId: Section }> = ({ children, sectionId }) => (
  <motion.div
    key={sectionId}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.4, ease: "easeInOut" }}
    className="absolute inset-0 pt-16 overflow-y-auto scrollbar-thin scrollbar-thumb-accent scrollbar-track-secondary" // Adjusted padding top & added scrollbar styling
  >
    <div className="container mx-auto px-4 py-8">
      {children}
    </div>
  </motion.div>
);

const NextSectionButton: React.FC<{ onClick: () => void, nextSectionLabel: string }> = ({ onClick, nextSectionLabel }) => (
  <Button
    variant="ghost"
    onClick={onClick}
    className="mt-6 group text-muted-foreground hover:text-accent"
  >
    Next: {nextSectionLabel}
    <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
  </Button>
);

const HomeSection: React.FC<SectionProps> = ({ data, setActiveSection }) => (
 <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] text-center">
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.5,
        delay: 0.1,
        ease: [0, 0.71, 0.2, 1.01] // Custom bounce effect
      }}
    >
      <Avatar className="w-32 h-32 mb-6 border-4 border-accent shadow-lg animate-bounce-subtle"> {/* Added animation */}
        {/* Use a dynamic image source if available in data, otherwise fallback */}
        <AvatarImage src={data.profileImageUrl || "https://picsum.photos/200"} alt={data.name} />
        <AvatarFallback>{data.name?.charAt(0) || 'N'}</AvatarFallback>
      </Avatar>
    </motion.div>
    <motion.h1
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="text-4xl md:text-6xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-primary animate-gradient-x" // Added gradient animation
    >
      {data.name || 'Naman Kumar'}
    </motion.h1>
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="text-xl md:text-2xl text-muted-foreground mb-6 h-8 md:h-10" // Added fixed height
    >
      <TypeAnimation
        sequence={[
          'Full Stack Developer', 2000,
          'Welcome to my Portfolio!', 2000,
          'Building Scalable Solutions', 2000,
          'Passionate about Code', 2000,
        ]}
        wrapper="span"
        cursor={true}
        repeat={Infinity}
        style={{ display: 'inline-block' }}
        className="text-accent" // Style the animation text
      />
    </motion.div>
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            delayChildren: 0.7, // Start after other elements
            staggerChildren: 0.2, // Stagger the buttons
          },
        },
      }}
      className="flex space-x-4 mb-8"
    >
       {/* Stagger animation for buttons */}
       {[
         { href: data.github, label: 'GitHub', icon: Github },
         { href: data.linkedin, label: 'LinkedIn', icon: Linkedin },
         { href: `mailto:${data.email}`, label: 'Email', icon: Mail },
       ].map((item, index) => item.href && ( // Only render if href exists
          <motion.div
            key={item.label}
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
          >
            <Link href={item.href} target={item.label !== 'Email' ? "_blank" : undefined} passHref legacyBehavior>
              <Button
                variant="outline"
                size="icon"
                aria-label={item.label}
                className="hover:bg-accent hover:text-accent-foreground transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-accent/30"
              >
                <item.icon className="h-5 w-5" />
              </Button>
            </Link>
         </motion.div>
       ))}
    </motion.div>
     <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1.3 }} // Delayed animation
        whileHover={{ scale: 1.05 }} // Scale on hover
        whileTap={{ scale: 0.95 }} // Scale on tap/click
      >
         <Button onClick={() => setActiveSection('about')} className="bg-accent text-accent-foreground hover:bg-accent/90 group shadow-md hover:shadow-lg transition-all duration-300">
            Learn More About Me <ArrowDown className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-y-1" />
        </Button>
     </motion.div>
  </div>
);

const AboutSection: React.FC<SectionProps> = ({ data, setActiveSection }) => {
  const nextSectionIndex = sectionOrder.indexOf('about') + 1;
  const nextSectionId = sectionOrder[nextSectionIndex % sectionOrder.length]; // Wrap around if last section
  const nextSectionLabel = nextSectionId.charAt(0).toUpperCase() + nextSectionId.slice(1);

  return (
    <Card className="bg-card/80 backdrop-blur-sm animate-fade-in">
      <CardHeader>
        <CardTitle className="text-3xl font-bold text-accent flex items-center"><User className="mr-2"/> About Me</CardTitle>
        <Separator className="my-2 bg-border/50"/>
      </CardHeader>
      <CardContent>
        <p className="text-lg mb-6">{data.objective || 'Objective not available.'}</p>

        <h3 className="text-2xl font-semibold mb-4 text-primary">Technical Skills</h3>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {data.skills && Object.entries(data.skills).map(([category, skillsList]) => (
            skillsList && skillsList.length > 0 && ( // Check if skillsList exists and is not empty
              <Card key={category} className="bg-secondary/50 transition-shadow duration-300 hover:shadow-lg hover:shadow-accent/20">
                <CardHeader>
                  <CardTitle className="text-xl capitalize text-accent">{category}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside space-y-1 text-foreground/90">
                    {skillsList.map((skill) => (
                      <li key={skill}>{skill}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )
          ))}
        </div>

         <h3 className="text-2xl font-semibold mb-4 text-primary">Languages Known</h3>
        <div className="flex space-x-4 text-lg mb-6">
          {data.languagesKnown && data.languagesKnown.map((lang) => (
            <span key={lang} className="bg-secondary/50 px-3 py-1 rounded-md">{lang}</span>
          ))}
        </div>
      </CardContent>
       <CardFooter className="flex justify-end">
        <NextSectionButton onClick={() => setActiveSection(nextSectionId)} nextSectionLabel={nextSectionLabel} />
      </CardFooter>
    </Card>
  );
};

const ExperienceSection: React.FC<SectionProps> = ({ data, setActiveSection }) => {
   const nextSectionIndex = sectionOrder.indexOf('experience') + 1;
   const nextSectionId = sectionOrder[nextSectionIndex % sectionOrder.length];
   const nextSectionLabel = nextSectionId.charAt(0).toUpperCase() + nextSectionId.slice(1);

  return (
    <Card className="bg-card/80 backdrop-blur-sm animate-fade-in">
      <CardHeader>
        <CardTitle className="text-3xl font-bold text-accent flex items-center"><Briefcase className="mr-2"/> Professional Experience</CardTitle>
         <Separator className="my-2 bg-border/50"/>
      </CardHeader>
      <CardContent className="space-y-6">
        {data.experience && data.experience.map((exp, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="border-l-4 border-accent pl-4 py-2 transition-all duration-300 hover:bg-secondary/30 rounded-r-md"
          >
            <h3 className="text-xl font-semibold text-primary">{exp.title}</h3>
            <p className="text-lg text-muted-foreground">{exp.company} | {exp.duration}</p>
            {exp.project && <p className="font-medium mt-1">Project: {exp.project}</p>}
            <ul className="list-disc list-inside mt-2 space-y-1 text-foreground/90">
              {exp.description && exp.description.map((desc, i) => (
                <li key={i}>{desc}</li>
              ))}
            </ul>
          </motion.div>
        ))}
      </CardContent>
      <CardFooter className="flex justify-end">
        <NextSectionButton onClick={() => setActiveSection(nextSectionId)} nextSectionLabel={nextSectionLabel} />
      </CardFooter>
    </Card>
  );
};

const ProjectsSection: React.FC<SectionProps> = ({ data, setActiveSection }) => {
   const nextSectionIndex = sectionOrder.indexOf('projects') + 1;
   const nextSectionId = sectionOrder[nextSectionIndex % sectionOrder.length];
   const nextSectionLabel = nextSectionId.charAt(0).toUpperCase() + nextSectionId.slice(1);

  return (
   <Card className="bg-card/80 backdrop-blur-sm animate-fade-in">
      <CardHeader>
        <CardTitle className="text-3xl font-bold text-accent flex items-center"><Lightbulb className="mr-2"/> Projects</CardTitle>
        <Separator className="my-2 bg-border/50"/>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {data.projects && data.projects.map((proj, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <Card className="h-full bg-secondary/50 flex flex-col transition-transform duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-accent/20">
              <CardHeader>
                <CardTitle className="text-xl text-primary">{proj.title}</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">{proj.stack} | {proj.duration}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <ul className="list-disc list-inside space-y-1 text-foreground/90">
                  {proj.description && proj.description.map((desc, i) => (
                    <li key={i}>{desc}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </CardContent>
       <CardFooter className="flex justify-end">
        <NextSectionButton onClick={() => setActiveSection(nextSectionId)} nextSectionLabel={nextSectionLabel} />
      </CardFooter>
    </Card>
  );
};

const EducationSection: React.FC<SectionProps> = ({ data, setActiveSection }) => {
   const nextSectionIndex = sectionOrder.indexOf('education') + 1;
   const nextSectionId = sectionOrder[nextSectionIndex % sectionOrder.length];
   const nextSectionLabel = nextSectionId.charAt(0).toUpperCase() + nextSectionId.slice(1);

  return (
   <Card className="bg-card/80 backdrop-blur-sm animate-fade-in">
      <CardHeader>
        <CardTitle className="text-3xl font-bold text-accent flex items-center"><GraduationCap className="mr-2"/> Education & Certifications</CardTitle>
        <Separator className="my-2 bg-border/50"/>
      </CardHeader>
      <CardContent>
        <h3 className="text-2xl font-semibold mb-4 text-primary">Education</h3>
        <div className="space-y-4 mb-6">
          {data.education && data.education.map((edu, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="p-3 bg-secondary/50 rounded-md transition-shadow duration-300 hover:shadow-md hover:shadow-accent/10"
            >
              <p className="text-lg font-medium text-primary">{edu.degree}</p>
              <p className="text-md text-muted-foreground">{edu.institution} | {edu.duration}</p>
            </motion.div>
          ))}
        </div>

        <h3 className="text-2xl font-semibold mb-4 text-primary">Certifications</h3>
         <div className="flex flex-wrap gap-3">
          {data.certifications && data.certifications.map((cert, index) => (
             <motion.span
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="bg-secondary/50 px-3 py-1 rounded-full text-sm text-foreground/90 shadow-sm"
              >
              {cert}
              </motion.span>
          ))}
        </div>
      </CardContent>
       <CardFooter className="flex justify-end">
        <NextSectionButton onClick={() => setActiveSection(nextSectionId)} nextSectionLabel={nextSectionLabel} />
      </CardFooter>
    </Card>
  );
};

const ContactSection: React.FC<ContactSectionProps> = ({ data }) => {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      email: '',
      message: '',
    },
  });

  async function onSubmit(values: ContactFormValues) {
    startTransition(async () => {
      const result = await sendEmailAction(values);
      if (result.success) {
        toast({
          title: "Success!",
          description: "Your message has been sent.",
        });
        form.reset(); // Reset form on success
      } else {
        toast({
          title: "Error!",
          description: result.error || "Failed to send message. Please try again.",
          variant: "destructive",
        });
      }
    });
  }

  return (
    <Card className="bg-card/80 backdrop-blur-sm animate-fade-in">
      <CardHeader>
        <CardTitle className="text-3xl font-bold text-accent flex items-center"><Mail className="mr-2"/> Get In Touch</CardTitle>
        <Separator className="my-2 bg-border/50"/>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Contact Info */}
        <div className="space-y-4 text-lg">
           <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
            Feel free to reach out via the form, email, or connect on social media.
          </motion.p>
          {data.email && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="flex items-center space-x-3 hover:text-accent transition-colors duration-200 group">
                <Mail className="h-5 w-5 text-muted-foreground group-hover:text-accent transition-colors duration-200" />
                <a href={`mailto:${data.email}`} className="break-all">{data.email}</a>
            </motion.div>
          )}
          {data.phone && (
           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="flex items-center space-x-3 group">
             <Phone className="h-5 w-5 text-muted-foreground" />
            <span>{data.phone}</span>
          </motion.div>
          )}
          {data.location && (
           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="flex items-start space-x-3 group">
             <MapPin className="h-5 w-5 text-muted-foreground mt-1 shrink-0" />
            <span>{data.location}</span>
          </motion.div>
          )}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="flex flex-wrap gap-4 pt-4">
              {data.github && (
                  <Link href={data.github} target="_blank" passHref legacyBehavior>
                    <Button variant="outline" className="hover:bg-accent hover:text-accent-foreground transition-colors duration-200">
                        <Github className="mr-2 h-4 w-4" /> GitHub
                    </Button>
                  </Link>
              )}
               {data.linkedin && (
                  <Link href={data.linkedin} target="_blank" passHref legacyBehavior>
                    <Button variant="outline" className="hover:bg-accent hover:text-accent-foreground transition-colors duration-200">
                        <Linkedin className="mr-2 h-4 w-4" /> LinkedIn
                    </Button>
                  </Link>
               )}
               {data.portfolioLink && (
                   <Link href={data.portfolioLink} target="_blank" passHref legacyBehavior>
                    <Button variant="outline" className="hover:bg-accent hover:text-accent-foreground transition-colors duration-200">
                         <LinkIcon className="mr-2 h-4 w-4" /> Portfolio
                    </Button>
                  </Link>
               )}
          </motion.div>
        </div>

         {/* Contact Form */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your Name" {...field} className="bg-secondary/50 focus:bg-background" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="your.email@example.com" {...field} className="bg-secondary/50 focus:bg-background" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Your message here..."
                        className="min-h-[120px] bg-secondary/50 focus:bg-background"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <Button type="submit" disabled={isPending} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                {isPending ? (
                   <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                Send Message
              </Button>
            </form>
          </Form>
        </motion.div>
      </CardContent>
      {/* No "Next Section" button here as it's the last section */}
       <CardFooter className="flex justify-end">
         {/* Optionally add a button to go back to the home section */}
         <Button
            variant="ghost"
            onClick={() => window.location.href = '/#home'} // Simple navigation back home for now
            className="mt-6 group text-muted-foreground hover:text-accent"
          >
            Back to Home
            <Home className="ml-2 h-4 w-4" />
          </Button>
      </CardFooter>
    </Card>
  );
};

// Loading Skeleton
const SectionLoadingSkeleton = () => (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Loader2 className="h-16 w-16 animate-spin text-accent" />
    </div>
);


// --- Main App Component ---
export default function PortfolioPage() {
  const [activeSection, setActiveSection] = useState<Section>('home');
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getPortfolioData();
        setPortfolioData(data);
      } catch (err) {
        console.error("Failed to load portfolio data:", err);
        setError("Could not load portfolio content. Please try again later.");
        // Optionally set default data here if needed on error
        // setPortfolioData(defaultPortfolioData);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []); // Fetch data on initial mount


  const renderSection = () => {
    if (loading) {
      return <SectionLoadingSkeleton />;
    }
    if (error) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] text-center text-destructive">
             <ServerIcon className="h-12 w-12 mb-4"/>
             <p className="text-xl">{error}</p>
         </div>
      )
    }
     if (!portfolioData) {
      return (
         <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] text-center text-muted-foreground">
             <ServerIcon className="h-12 w-12 mb-4"/>
             <p className="text-xl">Portfolio data is currently unavailable.</p>
         </div>
       );
    }


    switch (activeSection) {
      case 'home':
        return <HomeSection data={portfolioData} setActiveSection={setActiveSection} />;
      case 'about':
        return <AboutSection data={portfolioData} setActiveSection={setActiveSection} />;
      case 'experience':
        return <ExperienceSection data={portfolioData} setActiveSection={setActiveSection} />;
      case 'projects':
        return <ProjectsSection data={portfolioData} setActiveSection={setActiveSection} />;
      case 'education':
        return <EducationSection data={portfolioData} setActiveSection={setActiveSection} />;
      case 'contact':
        return <ContactSection data={portfolioData} />;
      default:
        return <HomeSection data={portfolioData} setActiveSection={setActiveSection} />;
    }
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-gradient-to-br from-background via-card to-background">
       {/* Subtle Background Pattern */}
       <div className="absolute inset-0 z-0 opacity-[0.02]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%239C92AC\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'}}></div>

      <Navbar activeSection={activeSection} setActiveSection={setActiveSection} />
      <main className="relative h-full pt-16"> {/* Ensure main content area respects navbar height */}
        <AnimatePresence mode="wait">
          <SectionWrapper key={activeSection} sectionId={activeSection}>
            {/* Use Suspense boundary if needed for future async components within sections */}
            <Suspense fallback={<SectionLoadingSkeleton />}>
                {renderSection()}
            </Suspense>
          </SectionWrapper>
        </AnimatePresence>
      </main>
       {/* Admin Panel Link */}
       <Link href="/admin" passHref legacyBehavior>
         <Button
            variant="secondary"
            size="sm"
            className="fixed bottom-4 right-4 z-20 opacity-70 hover:opacity-100 transition-opacity"
            aria-label="Admin Panel"
          >
          Admin
         </Button>
        </Link>
    </div>
  );
}
