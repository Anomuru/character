export type Instrument = { name: string; emoji: string };

export type Job = {
  id: string;
  name: string;
  title: string;
  tagline: string;
  description: string;
  bodyColor: string;
  hatColor: string;
  accentColor: string;
  hatType: "chef" | "hardhat" | "cap" | "none";
  toolEmoji: string;
  instruments: Instrument[];
  stats: { skill: number; speed: number; creativity: number };
};

export const JOBS: Job[] = [
  {
    id: "chef",
    name: "Marco",
    title: "Master Chef",
    tagline: "Cooks with passion and precision",
    description:
      "Marco runs the busiest kitchen in town. Quick hands, sharper instincts.",
    bodyColor: "#f5f5f5",
    hatColor: "#ffffff",
    accentColor: "#e74c3c",
    hatType: "chef",
    toolEmoji: "🔪",
    instruments: [
      { name: "Chef Knife", emoji: "🔪" },
      { name: "Frying Pan", emoji: "🍳" },
      { name: "Mixing Bowl", emoji: "🥣" },
      { name: "Spice Rack", emoji: "🧂" },
      { name: "Recipe Book", emoji: "📖" },
    ],
    stats: { skill: 92, speed: 78, creativity: 88 },
  },
  {
    id: "doctor",
    name: "Dr. Lin",
    title: "Surgeon",
    tagline: "Steady hands, sharp mind",
    description:
      "Dr. Lin saves lives in the ER. Calm under pressure, always prepared.",
    bodyColor: "#a8d8ea",
    hatColor: "#ffffff",
    accentColor: "#3498db",
    hatType: "none",
    toolEmoji: "🩺",
    instruments: [
      { name: "Stethoscope", emoji: "🩺" },
      { name: "Syringe", emoji: "💉" },
      { name: "Scalpel", emoji: "🔬" },
      { name: "First Aid Kit", emoji: "🧰" },
      { name: "Medical Chart", emoji: "📋" },
    ],
    stats: { skill: 95, speed: 70, creativity: 60 },
  },
  {
    id: "mechanic",
    name: "Jax",
    title: "Mechanic",
    tagline: "If it's broken, Jax fixes it",
    description:
      "Jax can rebuild any engine blindfolded. Grease under the nails, gold in the hands.",
    bodyColor: "#3a3a3a",
    hatColor: "#f1c40f",
    accentColor: "#e67e22",
    hatType: "cap",
    toolEmoji: "🔧",
    instruments: [
      { name: "Wrench", emoji: "🔧" },
      { name: "Screwdriver", emoji: "🪛" },
      { name: "Hammer", emoji: "🔨" },
      { name: "Toolbox", emoji: "🧰" },
      { name: "Oil Can", emoji: "🛢️" },
    ],
    stats: { skill: 88, speed: 82, creativity: 70 },
  },
  {
    id: "builder",
    name: "Sam",
    title: "Construction Pro",
    tagline: "Builds dreams from blueprints",
    description:
      "Sam leads the crew on every site. Precision, strength, and a great laugh.",
    bodyColor: "#e67e22",
    hatColor: "#f39c12",
    accentColor: "#d35400",
    hatType: "hardhat",
    toolEmoji: "🔨",
    instruments: [
      { name: "Hammer", emoji: "🔨" },
      { name: "Drill", emoji: "🛠️" },
      { name: "Measuring Tape", emoji: "📏" },
      { name: "Blueprints", emoji: "📐" },
      { name: "Hard Hat", emoji: "⛑️" },
    ],
    stats: { skill: 85, speed: 75, creativity: 65 },
  },
  {
    id: "scientist",
    name: "Dr. Vega",
    title: "Scientist",
    tagline: "Curiosity is the greatest tool",
    description:
      "Dr. Vega's lab unlocks new discoveries weekly. Always one experiment from genius.",
    bodyColor: "#ecf0f1",
    hatColor: "#9b59b6",
    accentColor: "#8e44ad",
    hatType: "none",
    toolEmoji: "🧪",
    instruments: [
      { name: "Beakers", emoji: "🧪" },
      { name: "Microscope", emoji: "🔬" },
      { name: "Lab Notebook", emoji: "📓" },
      { name: "Goggles", emoji: "🥽" },
      { name: "DNA Sample", emoji: "🧬" },
    ],
    stats: { skill: 96, speed: 60, creativity: 94 },
  },
];
