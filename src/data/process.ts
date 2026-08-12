export interface ProcessStep {
  id: string;
  label: string;
  title: string;
  body: string;
}

export const PROCESS_STEPS: ProcessStep[] = [
  {
    id: "01",
    label: "Discovery call",
    title: "We talk through the problem, not the tech stack.",
    body: "A short call to understand what you're actually trying to solve, what's been tried, and what success looks like. No pitch deck, no obligation - just enough context to know if I'm the right fit.",
  },
  {
    id: "02",
    label: "Scope & proposal",
    title: "A written plan before any code gets written.",
    body: "You get a clear scope, timeline, and fixed quote or rate - broken into milestones so you always know what's being built and when. No surprises once work starts.",
  },
  {
    id: "03",
    label: "Build & iterate",
    title: "Regular check-ins, working software early.",
    body: "I ship in small, reviewable increments rather than disappearing for weeks. You'll see progress against the milestones as it happens, with room to adjust as real usage surfaces new priorities.",
  },
  {
    id: "04",
    label: "Ship & support",
    title: "Deployed, documented, and handed off cleanly.",
    body: "Launch with documentation and a clean handoff - plus a defined window of post-launch support to fix anything that surfaces under real traffic before I step back.",
  },
];
