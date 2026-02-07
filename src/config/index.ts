import type { SiteConfig, SiteContent } from "../types";

export const SITE_CONFIG: SiteConfig = {
  title: "Mohammed Halboup — Fullstack Developer",
  author: "Mohammed Halboup",
  description:
    "Computer Science student at Universität des Saarlandes and a fullstack developer at PersonalClientCare (PCC).",
  lang: "en",
  siteLogo: "/Mo_small.jpg",
  navLinks: [
    { text: "Experience", href: "#experience" },
    { text: "Projects", href: "#projects" },
    { text: "About", href: "#about" },
  ],
  socialLinks: [
    { text: "Github", href: "https://github.com/MohdEssam77" },
    { text: "LinkedIn", href: "https://www.linkedin.com/in/mohammedhalboup-7e10/" },
    { text: "Instagram", href: "https://www.instagram.com/iamm.esam/" },
  ],
};

export const SITE_CONTENT: SiteContent = {
  hero: {
    name: "Mohammed Halboup",
    specialty: "Fullstack Developer",
    summary:
      "Computer science student at Universität des Saarlandes and a fullstack developer at PersonalClientCare (PCC).",
    email: "mohammedhalboub23@gmail.com",
    phone: "+49 176 74522561",
  },
  experience: [
    {
      company: "PersonalClientCare (PCC)",
      position: "Fullstack Developer",
      startDate: "2025",
      endDate: "Present",
      summary: [
        "Developing user-facing UI features and backend automation for application.",
        "Designining and implementing backend APIs and data workflows supporting intelligent automation.",
        "Delivering scalable, production-ready improvements in an agile engineering environment.",
      ],
    },
    {
      company: "Universität des Saarlandes",
      position: "Software Engineering Lab (Internship / Project-Based Course)",
      startDate: "August, 2025",
      endDate: "October, 2025",
      summary: [
        "Built SaarValley, a full simulation platform modeling farming workflows end-to-end (environment, animals,machines, harvesting, incidents).",
        "Owned the software lifecycle: requirements, system design, implementation and testing",
        "Collaborated in a team of 6-7 setting with structured development practices and validation of simulation behavior."
      ],
    },
  ],
  projects: [
    {
      name: "SwissInsight",
      summary: "Natural language query system for Swiss startup data using SPARQL and semantic search",
      linkPreview: "https://innosuisse-startupticker-dp5myu4aawkhwuopq74ev9.streamlit.app/",
      linkSource: "https://github.com/MohdEssam77/innosuisse-startupticker",
      image: "/swiss.png",
    },
    {
      name: "DreamTransport",
      summary: "Optimizing Neumarkt's bus network through data-driven performance and mathematical modeling.",
      linkSource: "https://github.com/MohdEssam77/DreamTransport",
      image: "/dream_transport.gif",
    },
    {
      name: "Klebl AI (Hackathon Winner)",
      summary: "Used YOLOv11 and Gemini API to analyze construction blueprints, reducing analysis time by 90%",
      linkSource: "https://github.com/MohdEssam77/Klebl-AI",
      image: "/klebl_ai.png",
    },
    {
      name: "UdS OP (Universal Desktop Assistant)",
      summary: "AI assistant capable of code execution, file operations, browsing, and searches.",
      linkSource: "https://github.com/MohdEssam77/UdS_Operator",
      image: "/uds_operator.png",
    },
    {
      name: "VoiceOasis",
      summary: "Hackathon-winning real-time voice enhancement and conversational memory system with speaker recognition, designed under strict latency and privacy constraints.",
      linkSource: "https://github.com/MohdEssam77/Voice_Oasis",
      image: "/voice_oasis.png",
    },
    {
      name: "Q-Wordle",
      summary: "Wordle is a game similar to Mastermind. The goal is to guess a word in as few attempts as possible. It also supports Quantum Wordle (putting a quantum twist on the game).",
      linkSource: "https://github.com/MohdEssam77/Q-Wordle",
      image: "/qwordle.jpg",
    },
    {
      name: "MiniCompiler",
      summary: "Developed a mini compiler using OCaml (functional programming language). It is my first project and it was done as part of a university course (Programming 1) at Saarland University.",
      linkSource: "https://github.com/MohdEssam77/miniCompiler",
      image: "/ocaml.png",
    }
  ],
  about: {
    description: `
      Full-Stack Engineer (Werkstudent) at PCC and Computer Science student at Saarland University, focused on
      building reliable software systems and shipping production-ready features. Interested in backend automation,
      scalable web products, and practical AI applications. Participate in hackathons whenever possible to stay
      hands-on with cutting-edge technologies and collaborate with diverse teams. Interested in quantum computing
      and its potential applications in optimization and machine learning. Football player too (in Saar 05)😉.
    `,
    image: "/Mo_big_fr.jpeg",
  },
};

// #5755ff
