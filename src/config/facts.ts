// "Know more about Halboup": short summaries of the experience, projects and
// hackathons in ./index.ts. One is revealed at random for every penalty scored.

export interface Fact {
  kind: "Experience" | "Project" | "Hackathon";
  title: string;
  text: string;
  section: "#experience" | "#projects" | "#hackathons";
}

export const FACTS: Fact[] = [
  {
    kind: "Experience",
    title: "PersonalClientCare (PCC)",
    text: "Fullstack Developer since September 2025: building user-facing features, backend APIs and the automation behind them.",
    section: "#experience",
  },
  {
    kind: "Experience",
    title: "SE Lab Teaching Assistant",
    text: "Architected Saar la carte, a full restaurant simulation, mentored students through the whole lifecycle and wrote the tests used to grade them.",
    section: "#experience",
  },
  {
    kind: "Experience",
    title: "Software Engineering Lab",
    text: "Built SaarValley, a farming simulation covering animals, machines, harvests and incidents, in a team of 6–7, from requirements to testing.",
    section: "#experience",
  },
  {
    kind: "Project",
    title: "MetalPulse",
    text: "A real-time precious-metals dashboard with live spot prices, ETF tracking, price alerts, market news and an AI analyst you can chat with.",
    section: "#projects",
  },
  {
    kind: "Project",
    title: "InkedIn",
    text: "Writes professional LinkedIn posts in seconds, in the tone, style and personality you pick.",
    section: "#projects",
  },
  {
    kind: "Project",
    title: "SwissInsight",
    text: "Ask questions about Swiss startup data in plain language; SPARQL and semantic search do the rest.",
    section: "#projects",
  },
  {
    kind: "Project",
    title: "DreamTransport",
    text: "Used passenger data, punctuality analysis and mathematical modelling to optimise Neumarkt's bus network.",
    section: "#projects",
  },
  {
    kind: "Project",
    title: "Klebl AI",
    text: "YOLOv11 plus the Gemini API reading construction blueprints, cutting analysis time by 90%.",
    section: "#projects",
  },
  {
    kind: "Project",
    title: "UdS OP",
    text: "A desktop AI assistant that can execute code, work with files, browse the web and search for you.",
    section: "#projects",
  },
  {
    kind: "Project",
    title: "VoiceOasis",
    text: "Real-time voice enhancement and conversational memory with speaker recognition, built under strict latency and privacy constraints.",
    section: "#projects",
  },
  {
    kind: "Project",
    title: "Q-Wordle",
    text: "Wordle, the Mastermind-style word game, with an optional quantum twist.",
    section: "#projects",
  },
  {
    kind: "Hackathon",
    title: "MITTELSTAND HACKATHON · 1st",
    text: "Won the Klebl GmbH challenge in Neumarkt with Klebl AI, the blueprint analyser.",
    section: "#hackathons",
  },
  {
    kind: "Hackathon",
    title: "{Tech: Europe} AI Hackathon · 3rd",
    text: "Took 3rd place in Munich with UdS OP, the universal desktop assistant.",
    section: "#hackathons",
  },
  {
    kind: "Hackathon",
    title: "START HACK 2025 · 3rd",
    text: "Took 3rd in St. Gallen by co-developing VoiceOasis, a privacy-focused voice AI for robotics.",
    section: "#hackathons",
  },
  {
    kind: "Hackathon",
    title: "SwissHacks · 2nd",
    text: "Finished 2nd in Zurich with SwissInsight, AI-driven analytics for Swiss startup data.",
    section: "#hackathons",
  },
  {
    kind: "Hackathon",
    title: "Servus AI Summer · 2nd",
    text: "Finished 2nd in Neumarkt with DreamTransport, data-driven bus route optimisation.",
    section: "#hackathons",
  },
];
