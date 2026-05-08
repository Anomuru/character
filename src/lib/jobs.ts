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
    name: "Marko",
    title: "Oshpaz Ustasi",
    tagline: "Ishtiyoq va aniqlik bilan tayyorlaydi",
    description:
      "Marko shahardagi eng band oshxonani boshqaradi. Tez qo'llar, o'tkir sezgi.",
    bodyColor: "#f5f5f5",
    hatColor: "#ffffff",
    accentColor: "#e74c3c",
    hatType: "chef",
    toolEmoji: "🔪",
    instruments: [
      { name: "Oshpaz Pichog'i", emoji: "🔪" },
      { name: "Qovurilgan Tovasi", emoji: "🍳" },
      { name: "Aralashtirish Kosasi", emoji: "🥣" },
      { name: "Ziravorlar Javoni", emoji: "🧂" },
      { name: "Retsept Kitobi", emoji: "📖" },
    ],
    stats: { skill: 92, speed: 78, creativity: 88 },
  },
  {
    id: "doctor",
    name: "Doktor Lin",
    title: "Jarroh",
    tagline: "Barqaror qo'llar, o'tkir aql",
    description:
      "Doktor Lin tez yordam bo'limida hayot qutqaradi. Bosim ostida xotirjam, doimo tayyor.",
    bodyColor: "#a8d8ea",
    hatColor: "#ffffff",
    accentColor: "#3498db",
    hatType: "none",
    toolEmoji: "🩺",
    instruments: [
      { name: "Stetoskop", emoji: "🩺" },
      { name: "Shprits", emoji: "💉" },
      { name: "Skalpel", emoji: "🔬" },
      { name: "Birinchi Yordam Qutisi", emoji: "🧰" },
      { name: "Tibbiy Jadval", emoji: "📋" },
    ],
    stats: { skill: 95, speed: 70, creativity: 60 },
  },
  {
    id: "mechanic",
    name: "Jaks",
    title: "Mexanik",
    tagline: "Agar buzilgan bo'lsa, Jaks tuzatadi",
    description:
      "Jaks har qanday dvigatelni ko'zi bog'liq holda qayta qurishi mumkin. Tirnoqlar ostida moy, qo'llarda oltin.",
    bodyColor: "#3a3a3a",
    hatColor: "#f1c40f",
    accentColor: "#e67e22",
    hatType: "cap",
    toolEmoji: "🔧",
    instruments: [
      { name: "Gayka Kaliti", emoji: "🔧" },
      { name: "Otvertka", emoji: "🪛" },
      { name: "Bolg'a", emoji: "🔨" },
      { name: "Asboblar Qutisi", emoji: "🧰" },
      { name: "Moy Idishi", emoji: "🛢️" },
    ],
    stats: { skill: 88, speed: 82, creativity: 70 },
  },
  {
    id: "builder",
    name: "Sem",
    title: "Qurilish Professori",
    tagline: "Chizmalardan orzularni quradi",
    description:
      "Sem har bir qurilish maydonida jamoani boshqaradi. Aniqlik, kuch va ajoyib kulgi.",
    bodyColor: "#e67e22",
    hatColor: "#f39c12",
    accentColor: "#d35400",
    hatType: "hardhat",
    toolEmoji: "🔨",
    instruments: [
      { name: "Bolg'a", emoji: "🔨" },
      { name: "Drel", emoji: "🛠️" },
      { name: "O'lchov Lentasi", emoji: "📏" },
      { name: "Chizmalar", emoji: "📐" },
      { name: "Qattiq Dubulg'a", emoji: "⛑️" },
    ],
    stats: { skill: 85, speed: 75, creativity: 65 },
  },
  {
    id: "scientist",
    name: "Doktor Vega",
    title: "Olim",
    tagline: "Qiziquvchanlik eng katta asbob",
    description:
      "Doktor Veganing laboratoriyasi har hafta yangi kashfiyotlarni ochadi. Har doim daholardan bir tajriba narida.",
    bodyColor: "#ecf0f1",
    hatColor: "#9b59b6",
    accentColor: "#8e44ad",
    hatType: "none",
    toolEmoji: "🧪",
    instruments: [
      { name: "Stakanlar", emoji: "🧪" },
      { name: "Mikroskop", emoji: "🔬" },
      { name: "Laboratoriya Daftari", emoji: "📓" },
      { name: "Ko'zoynak", emoji: "🥽" },
      { name: "DNK Namunasi", emoji: "🧬" },
    ],
    stats: { skill: 96, speed: 60, creativity: 94 },
  },
];
