import { z } from 'zod';

const experienceSchema = z.object({
  title: z.string(),
  company: z.string(),
  duration: z.string(),
  project: z.string().optional(),
  description: z.array(z.string()),
});

const projectSchema = z.object({
  title: z.string(),
  stack: z.string(),
  duration: z.string(),
  description: z.array(z.string()),
});

const educationSchema = z.object({
  degree: z.string(),
  institution: z.string(),
  duration: z.string(),
});

export const portfolioDataSchema = z.object({
  _id: z.any().optional(), // Allow MongoDB ObjectId or string
  identifier: z.string().default('main'), // To easily find the main document
  name: z.string(),
  email: z.string().email(),
  location: z.string(),
  phone: z.string(),
  github: z.string().url(),
  linkedin: z.string().url(),
  portfolioLink: z.string().url(),
  objective: z.string(),
  skills: z.object({
    languages: z.array(z.string()),
    frontend: z.array(z.string()),
    backend: z.array(z.string()),
    database: z.array(z.string()),
    tools: z.array(z.string()),
  }),
  experience: z.array(experienceSchema),
  projects: z.array(projectSchema),
  education: z.array(educationSchema),
  certifications: z.array(z.string()),
  languagesKnown: z.array(z.string()),
});

export type PortfolioData = z.infer<typeof portfolioDataSchema>;

// Default data structure (can be used for initialization if DB is empty)
export const defaultPortfolioData: Omit<PortfolioData, '_id' | 'identifier'> = {
    name: 'Naman Kumar',
    email: 'namankumarcu@gmail.com',
    location: 'Shekhpur Thant, Bijnor, Uttar Pradesh',
    phone: '+91 8630495616',
    github: 'https://github.com/namanchauhan1026',
    linkedin: 'https://linkedin.com/in/naman-kumar',
    portfolioLink: 'https://naman-kumar.com', // Assuming this is the portfolio link
    objective: 'To leverage my full-stack development skills in building scalable, efficient, and user-centric software solutions. I aim to contribute to innovative projects using modern technologies like Node.js, React, GraphQL, and MongoDB, while continuously learning and growing as a developer in a collaborative and challenging environment.',
    skills: {
      languages: ['TypeScript', 'JavaScript', 'Java', 'C++', 'HTML', 'CSS'],
      frontend: ['React.js'],
      backend: ['Node.js', 'Express.js', 'Socket.IO', 'Node-Cron'],
      database: ['MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Prisma', 'Sequelize'],
      tools: ['GitHub', 'Postman', 'VS-Code', 'Firebase', 'REST', 'GraphQL'],
    },
    experience: [
      {
        title: 'Full Stack Developer',
        company: 'Galler India (LMD Pvt Ltd)',
        duration: 'Present',
        project: 'NOC (Network Operation Center)',
        description: [
          'Built a scalable NOC system for real-time monitoring and operations on IoT devices.',
          'Enabled dynamic device onboarding with MongoDB-based dynamic schema generation.',
          'Integrated role-based access control and modular architecture for better permission management.',
          'Implemented GraphQL with advanced filtering, real-time alerts via Socket.IO, and PostgreSQL via Prisma.',
          'Developed location hierarchy, device grouping, dynamic responses, and subscription management.',
        ],
      },
      {
        title: 'Full Stack Developer',
        company: 'ApnaBillBook',
        duration: 'Nov 2023 - Jan 2024', // Corrected end date based on context
        description: [
          'Developed scalable backend using Node.js and MySQL.',
          'Integrated Razorpay for payments, Shiprocket for order delivery, and third-party apps for order intake.',
          'Implemented Firebase + JWT authentication, and WhatsApp messaging using Meta API with RedisBull queue.',
          'Delivered features like stock settlement, appointment booking, supplier/due/order management, KOT, and bulk product upload using Excel.',
        ],
      },
    ],
    projects: [
      {
        title: 'E-commerce Website',
        stack: 'MERN Stack',
        duration: 'Mar 2024 – Jun 2024',
        description: [
          'Built a complete e-commerce system with Razorpay payments and scalable architecture.',
          'Designed responsive UI for shopping experience with real-time order tracking.',
        ],
      },
      {
        title: 'Live Coders - Real-time Code Collaboration',
        stack: 'MERN Stack',
        duration: 'Jan 2024 – May 2024',
        description: [
          'Created a code editor for up to 10 users with synchronized updates using WebSockets.',
          'Enabled collaborative coding sessions with smooth real-time interface.',
        ],
      },
       {
        title: 'Plant Disease Detection',
        stack: 'Python, Machine Learning',
        duration: 'Aug 2023 – Dec 2023',
        description: [
           'Built an image classifier to detect plant diseases with 90%+ accuracy.',
           'Developed web interface for uploading images and displaying model predictions.',
        ],
      },
    ],
    education: [
      {
        degree: 'Bachelor of Engineering (CSE)',
        institution: 'Chandigarh University, Punjab',
        duration: '2020 – 2024',
      },
      {
        degree: 'Senior Secondary and Secondary (12th & 10th)',
        institution: 'Parker Public Sr. Sec School',
        duration: '2018 – 2020',
      },
    ],
     certifications: [
      'Software Testing (NPTEL)',
      'Web Development Internship (Activecraft)',
      'Machine Learning (Coursera)',
      'Java (Coursera)',
      'AWS (Coursera)',
    ],
    languagesKnown: ['Hindi', 'English'],
};
