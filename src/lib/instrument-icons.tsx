import {
  UtensilsCrossed,
  CookingPot,
  Soup,
  Package,
  BookOpen,
  Book,
  Library,
  Stethoscope,
  Syringe,
  Scissors,
  BriefcaseMedical,
  ClipboardList,
  Clipboard,
  Wrench,
  Hammer,
  Cog,
  Drill,
  Ruler,
  HardHat,
  Fuel,
  DraftingCompass,
  FlaskConical,
  Microscope,
  Notebook,
  NotebookPen,
  Glasses,
  Dna,
  Search,
  TestTubes,
  BarChart3,
  Flame,
  Thermometer,
  BatteryFull,
  Lightbulb,
  Calculator,
  Mouse,
  Clock,
  Flashlight,
  Laptop,
  Keyboard,
  FileCode,
  Coffee,
  Bug,
  Pen,
  Globe,
  ScrollText,
  Radio,
  Scale,
  Megaphone,
  Medal,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  "Oshpaz Pichog'i": UtensilsCrossed,
  "Qovurilgan Tovasi": CookingPot,
  "Aralashtirish Kosasi": Soup,
  "Ziravorlar Javoni": Package,
  "Retsept Kitobi": BookOpen,
  Olov: Flame,

  Stetoskop: Stethoscope,
  Shprits: Syringe,
  Skalpel: Scissors,
  "Birinchi Yordam Qutisi": BriefcaseMedical,
  "Tibbiy Jadval": ClipboardList,
  Termometr: Thermometer,

  "Gayka Kaliti": Wrench,
  Otvertka: Cog,
  "Bolg'a": Hammer,
  "Asboblar Qutisi": Package,
  "Moy Idishi": Fuel,
  Akkumulyator: BatteryFull,

  Drel: Drill,
  "O'lchov Lentasi": Ruler,
  Chizmalar: DraftingCompass,
  "Qattiq Dubulg'a": HardHat,
  Lampochka: Lightbulb,

  "Tadqiqot Daftari": NotebookPen,
  Mikroskop: Microscope,
  Lupa: Search,
  Probirka: TestTubes,
  "Statistik Jadval": BarChart3,
  Kalkulyator: Calculator,

  Stakanlar: FlaskConical,
  "Laboratoriya Daftari": Notebook,
  "Ko'zoynak": Glasses,
  "DNK Namunasi": Dna,

  Noutbuk: Laptop,
  Klaviatura: Keyboard,
  "Kod Muharriri": FileCode,
  Kofe: Coffee,
  "Debugging Asboblari": Bug,
  Sichqoncha: Mouse,

  Kitoblar: Library,
  "Doska Markeri": Pen,
  Darslik: Book,
  Globus: Globe,
  Sertifikat: ScrollText,
  Soat: Clock,

  "Radio Aloqa": Radio,
  "Huquq Kitobi": Scale,
  Daftar: Clipboard,
  Hushtак: Megaphone,
  Nishon: Medal,
  Chiroq: Flashlight,
};

// Each tool gets its own vibrant tile: pastel surface, deeper border, saturated icon.
// Color values are kept as Tailwind-friendly HEX so we can pass them inline for tile bg.
export type ToolColor = {
  bg: string; // soft tile background
  border: string; // tile border
  icon: string; // icon stroke colour
  text: string; // label colour
  ring: string; // selected glow halo
};

// Vivid pastel palette — every tile gets a distinct, child-friendly hue.
// Backgrounds are saturated enough to be clearly different at a glance,
// while staying soft so dark icon strokes remain readable.
const PALETTE: Record<string, ToolColor> = {
  red: { bg: "#FFD9D6", border: "#F4A8A2", icon: "#B83227", text: "#3F1A14", ring: "#E06B5F" },
  orange: { bg: "#FFE2C2", border: "#F5B679", icon: "#C25A12", text: "#3F2208", ring: "#E68A35" },
  amber: { bg: "#FFEFB8", border: "#EBC95E", icon: "#9A6B0A", text: "#3F2C06", ring: "#D6A325" },
  yellow: { bg: "#FFF6A8", border: "#E6D74A", icon: "#8A6E0A", text: "#3F3206", ring: "#C5A91A" },
  lime: { bg: "#DDF3A8", border: "#A6CC58", icon: "#5A7510", text: "#22320A", ring: "#88AE2D" },
  green: { bg: "#C4ECC8", border: "#7CC384", icon: "#2A7A38", text: "#0F3318", ring: "#54A862" },
  teal: { bg: "#BFEEE3", border: "#65C3B0", icon: "#0E7C6A", text: "#073330", ring: "#3FA292" },
  cyan: { bg: "#BFEAF2", border: "#5EC1D0", icon: "#0F6E7E", text: "#062F36", ring: "#3DA0B0" },
  sky: { bg: "#CDE5FA", border: "#6FB0E8", icon: "#1A5DA8", text: "#0A2944", ring: "#4690D4" },
  blue: { bg: "#D2DCFC", border: "#7B92EA", icon: "#2E47A8", text: "#101D4A", ring: "#5772D4" },
  indigo: { bg: "#DCD4FB", border: "#9A87E2", icon: "#4A2EA8", text: "#1D1244", ring: "#7657D4" },
  violet: { bg: "#E4D2FA", border: "#B388E0", icon: "#6328A8", text: "#260F44", ring: "#9258D4" },
  purple: { bg: "#EDD0F5", border: "#C481D8", icon: "#83258A", text: "#330C36", ring: "#A85ABF" },
  pink: { bg: "#FBD4EC", border: "#E885C0", icon: "#A82680", text: "#440D33", ring: "#D659A8" },
  rose: { bg: "#FFD4DC", border: "#F58CA0", icon: "#B83254", text: "#400F1F", ring: "#E0617C" },
  brown: { bg: "#EBD7BD", border: "#C4A172", icon: "#7A5320", text: "#33220A", ring: "#A37C3F" },
  slate: { bg: "#D6DDE5", border: "#8FA0B3", icon: "#3F526B", text: "#16202C", ring: "#6A7E94" },
};

const COLOR_KEY: Record<string, keyof typeof PALETTE> = {
  // Chef — warm food kitchen colours
  "Oshpaz Pichog'i": "slate",
  "Qovurilgan Tovasi": "brown",
  "Aralashtirish Kosasi": "amber",
  "Ziravorlar Javoni": "rose",
  "Retsept Kitobi": "orange",
  Olov: "red",

  // Doctor — clinical blues + life-saving accents
  Stetoskop: "sky",
  Shprits: "cyan",
  Skalpel: "teal",
  "Birinchi Yordam Qutisi": "red",
  "Tibbiy Jadval": "indigo",
  Termometr: "rose",

  // Mechanic — industrial warm
  "Gayka Kaliti": "slate",
  Otvertka: "amber",
  "Bolg'a": "orange",
  "Asboblar Qutisi": "yellow",
  "Moy Idishi": "brown",
  Akkumulyator: "lime",

  // Builder — bright site colours
  Drel: "orange",
  "O'lchov Lentasi": "yellow",
  Chizmalar: "blue",
  "Qattiq Dubulg'a": "amber",
  Lampochka: "cyan",

  // Scientist — lab vibrancy
  "Tadqiqot Daftari": "violet",
  Mikroskop: "purple",
  Lupa: "indigo",
  Probirka: "green",
  "Statistik Jadval": "sky",
  Kalkulyator: "teal",

  Stakanlar: "cyan",
  "Laboratoriya Daftari": "blue",
  "Ko'zoynak": "slate",
  "DNK Namunasi": "pink",

  // Programmer — neon code
  Noutbuk: "indigo",
  Klaviatura: "slate",
  "Kod Muharriri": "violet",
  Kofe: "brown",
  "Debugging Asboblari": "lime",
  Sichqoncha: "sky",

  // Teacher — bright classroom
  Kitoblar: "rose",
  "Doska Markeri": "purple",
  Darslik: "orange",
  Globus: "sky",
  Sertifikat: "amber",
  Soat: "blue",

  // Police — official + safety
  "Radio Aloqa": "slate",
  "Huquq Kitobi": "indigo",
  Daftar: "blue",
  Hushtак: "yellow",
  Nishon: "amber",
  Chiroq: "lime",
};

const DEFAULT_COLOR: ToolColor = PALETTE.slate;

export function getToolColor(name: string): ToolColor {
  const key = COLOR_KEY[name];
  return (key && PALETTE[key]) || DEFAULT_COLOR;
}

export function InstrumentIcon({
  name,
  size = 56,
  className,
  style,
}: {
  name: string;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const Icon = ICONS[name] ?? Package;
  return <Icon size={size} strokeWidth={1.8} className={className} style={style} />;
}
