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
  // Ready Player Me .glb URL. Create avatars at https://readyplayer.me
  // then paste the URL here (format: https://models.readyplayer.me/{id}.glb).
  // Leave undefined to fall back to the primitive 3D character.
  modelUrl?: string;
};

export const JOBS: Job[] = [
  {
    id: "chef",
    name: "Marko",
    title: "Oshpaz",
    tagline: "Ishtiyoq va aniqlik bilan tayyorlaydi",
    description: "Marko shahardagi eng band oshxonani boshqaradi. Tez qo'llar, o'tkir sezgi.",
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
      { name: "Olov", emoji: "🔥" },
    ],
    stats: { skill: 92, speed: 78, creativity: 88 },
  },
  {
    id: "doctor",
    name: "Doktor Lin",
    title: "Shifokor",
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
      { name: "Termometr", emoji: "🌡️" },
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
      { name: "Akkumulyator", emoji: "🔋" },
    ],
    stats: { skill: 88, speed: 82, creativity: 70 },
  },
  {
    id: "builder",
    name: "Sem",
    title: "Quruvchi",
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
      { name: "Lampochka", emoji: "💡" },
    ],
    stats: { skill: 85, speed: 75, creativity: 65 },
  },
  {
    id: "scientist",
    name: "Doktor Vega",
    title: "Tadqiqotchi",
    tagline: "Qiziquvchanlik eng katta asbob",
    description:
      "Doktor Veganing laboratoriyasi har hafta yangi kashfiyotlarni ochadi. Har doim daholardan bir tajriba narida.",
    bodyColor: "#ecf0f1",
    hatColor: "#9b59b6",
    accentColor: "#8e44ad",
    hatType: "none",
    toolEmoji: "🔬",
    instruments: [
      { name: "Tadqiqot Daftari", emoji: "📓" },
      { name: "Mikroskop", emoji: "🔬" },
      { name: "Lupa", emoji: "🔍" },
      { name: "Probirka", emoji: "🧪" },
      { name: "Statistik Jadval", emoji: "📊" },
      { name: "Kalkulyator", emoji: "🧮" },
    ],
    stats: { skill: 96, speed: 60, creativity: 94 },
  },
  {
    id: "programmer",
    name: "Aziz",
    title: "Dasturchi",
    tagline: "Kod yozish orqali kelajakni yaratadi",
    description:
      "Aziz murakkab muammolarni oddiy dasturlarga aylantiradi. Klaviatura uning quroli, mantiq uning kuchi.",
    bodyColor: "#2c3e50",
    hatColor: "#34495e",
    accentColor: "#3498db",
    hatType: "cap",
    toolEmoji: "💻",
    instruments: [
      { name: "Noutbuk", emoji: "💻" },
      { name: "Klaviatura", emoji: "⌨️" },
      { name: "Kod Muharriri", emoji: "📝" },
      { name: "Kofe", emoji: "☕" },
      { name: "Debugging Asboblari", emoji: "🐛" },
      { name: "Sichqoncha", emoji: "🖱️" },
    ],
    stats: { skill: 90, speed: 85, creativity: 92 },
  },
  {
    id: "teacher",
    name: "Dilnoza",
    title: "O'qituvchi",
    tagline: "Bilim ulashish orqali kelajakni yoritadi",
    description:
      "Dilnoza har bir o'quvchining qobiliyatini ochadi. Sabr, mehr va bilim bilan to'la.",
    bodyColor: "#f39c12",
    hatColor: "#e67e22",
    accentColor: "#d35400",
    hatType: "none",
    toolEmoji: "📚",
    instruments: [
      { name: "Kitoblar", emoji: "📚" },
      { name: "Doska Markeri", emoji: "🖊️" },
      { name: "Darslik", emoji: "📖" },
      { name: "Globus", emoji: "🌍" },
      { name: "Sertifikat", emoji: "📜" },
      { name: "Soat", emoji: "⏰" },
    ],
    stats: { skill: 88, speed: 70, creativity: 85 },
  },
  {
    id: "police",
    name: "Sardor",
    title: "Politsiyachi",
    tagline: "Tartib va xavfsizlikni saqlaydi",
    description:
      "Sardor shahar ko'chalarida tinchlik va xavfsizlikni ta'minlaydi. Jasorat, adolat va mas'uliyat.",
    bodyColor: "#34495e",
    hatColor: "#2c3e50",
    accentColor: "#e74c3c",
    hatType: "cap",
    toolEmoji: "👮",
    instruments: [
      { name: "Radio Aloqa", emoji: "📻" },
      { name: "Huquq Kitobi", emoji: "⚖️" },
      { name: "Daftar", emoji: "📋" },
      { name: "Hushtак", emoji: "🔦" },
      { name: "Nishon", emoji: "🎖️" },
      { name: "Chiroq", emoji: "🔦" },
    ],
    stats: { skill: 87, speed: 80, creativity: 65 },
  },
];
