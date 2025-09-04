
interface MoodOption {
  id: string;
  emoji: string;
  labelTr: string;
  labelEn: string;
  labelDe: string;
  labelFr: string;
  labelEs: string;
  labelIt: string;
  labelRu: string;
  colors: {
    bg: string;
    hover: string;
    gradient: string;
    darkBg: string;
    darkHover: string;
    darkGradient: string;
  };
}

export const moodOptions: MoodOption[] = [
  { 
    id: "very-bad", 
    emoji: "😢", 
    labelTr: "Berbat", 
    labelEn: "Terrible",
    labelDe: "Schrecklich",
    labelFr: "Terrible",
    labelEs: "Terrible",
    labelIt: "Terribile",
    labelRu: "Ужасно",
    colors: {
      bg: "bg-red-100",
      hover: "hover:bg-red-200",
      gradient: "from-red-200 to-red-300",
      darkBg: "dark:bg-red-900/30",
      darkHover: "dark:hover:bg-red-800/40",
      darkGradient: "dark:from-red-800 dark:to-red-900"
    }
  },
  { 
    id: "bad", 
    emoji: "😞", 
    labelTr: "Kötü", 
    labelEn: "Bad",
    labelDe: "Schlecht",
    labelFr: "Mauvais",
    labelEs: "Malo",
    labelIt: "Male",
    labelRu: "Плохо",
    colors: {
      bg: "bg-orange-100",
      hover: "hover:bg-orange-200",
      gradient: "from-orange-200 to-orange-300",
      darkBg: "dark:bg-orange-900/30",
      darkHover: "dark:hover:bg-orange-800/40",
      darkGradient: "dark:from-orange-800 dark:to-orange-900"
    }
  },
  { 
    id: "neutral", 
    emoji: "😐", 
    labelTr: "İdare Eder", 
    labelEn: "Neutral",
    labelDe: "Neutral",
    labelFr: "Neutre",
    labelEs: "Neutral",
    labelIt: "Neutro",
    labelRu: "Нейтрально",
    colors: {
      bg: "bg-yellow-100",
      hover: "hover:bg-yellow-200",
      gradient: "from-yellow-200 to-yellow-300",
      darkBg: "dark:bg-yellow-900/30",
      darkHover: "dark:hover:bg-yellow-800/40",
      darkGradient: "dark:from-yellow-800 dark:to-yellow-900"
    }
  },
  { 
    id: "good", 
    emoji: "😊", 
    labelTr: "İyi", 
    labelEn: "Good",
    labelDe: "Gut",
    labelFr: "Bon",
    labelEs: "Bueno",
    labelIt: "Buono",
    labelRu: "Хорошо",
    colors: {
      bg: "bg-green-100",
      hover: "hover:bg-green-200",
      gradient: "from-green-200 to-green-300",
      darkBg: "dark:bg-green-900/30",
      darkHover: "dark:hover:bg-green-800/40",
      darkGradient: "dark:from-green-800 dark:to-green-900"
    }
  },
  { 
    id: "great", 
    emoji: "😄", 
    labelTr: "Harika", 
    labelEn: "Great",
    labelDe: "Großartig",
    labelFr: "Génial",
    labelEs: "Genial",
    labelIt: "Fantastico",
    labelRu: "Отлично",
    colors: {
      bg: "bg-emerald-100",
      hover: "hover:bg-emerald-200",
      gradient: "from-emerald-200 to-emerald-300",
      darkBg: "dark:bg-emerald-900/30",
      darkHover: "dark:hover:bg-emerald-800/40",
      darkGradient: "dark:from-emerald-800 dark:to-emerald-900"
    }
  },
  { 
    id: "sad", 
    emoji: "😔", 
    labelTr: "Hüzünlü", 
    labelEn: "Sad",
    labelDe: "Traurig",
    labelFr: "Triste",
    labelEs: "Triste",
    labelIt: "Triste",
    labelRu: "Грустно",
    colors: {
      bg: "bg-blue-100",
      hover: "hover:bg-blue-200",
      gradient: "from-blue-200 to-blue-300",
      darkBg: "dark:bg-blue-900/30",
      darkHover: "dark:hover:bg-blue-800/40",
      darkGradient: "dark:from-blue-800 dark:to-blue-900"
    }
  },
  { 
    id: "calm", 
    emoji: "😌", 
    labelTr: "Sakin", 
    labelEn: "Calm",
    labelDe: "Ruhig",
    labelFr: "Calme",
    labelEs: "Tranquilo",
    labelIt: "Calmo",
    labelRu: "Спокойно",
    colors: {
      bg: "bg-cyan-100",
      hover: "hover:bg-cyan-200",
      gradient: "from-cyan-200 to-cyan-300",
      darkBg: "dark:bg-cyan-900/30",
      darkHover: "dark:hover:bg-cyan-800/40",
      darkGradient: "dark:from-cyan-800 dark:to-cyan-900"
    }
  },
  { 
    id: "stressed", 
    emoji: "😰", 
    labelTr: "Stresli", 
    labelEn: "Stressed",
    labelDe: "Gestresst",
    labelFr: "Stressé",
    labelEs: "Estresado",
    labelIt: "Stressato",
    labelRu: "В стрессе",
    colors: {
      bg: "bg-amber-100",
      hover: "hover:bg-amber-200",
      gradient: "from-amber-200 to-amber-300",
      darkBg: "dark:bg-amber-900/30",
      darkHover: "dark:hover:bg-amber-800/40",
      darkGradient: "dark:from-amber-800 dark:to-amber-900"
    }
  },
  { 
    id: "excited", 
    emoji: "🤩", 
    labelTr: "Heyecanlı", 
    labelEn: "Excited",
    labelDe: "Aufgeregt",
    labelFr: "Excité",
    labelEs: "Emocionado",
    labelIt: "Eccitato",
    labelRu: "В восторге",
    colors: {
      bg: "bg-violet-100",
      hover: "hover:bg-violet-200",
      gradient: "from-violet-200 to-violet-300",
      darkBg: "dark:bg-violet-900/30",
      darkHover: "dark:hover:bg-violet-800/40",
      darkGradient: "dark:from-violet-800 dark:to-violet-900"
    }
  },
  { 
    id: "angry", 
    emoji: "😠", 
    labelTr: "Sinirli", 
    labelEn: "Angry",
    labelDe: "Wütend",
    labelFr: "En colère",
    labelEs: "Enojado",
    labelIt: "Arrabbiato",
    labelRu: "Злой",
    colors: {
      bg: "bg-rose-100",
      hover: "hover:bg-rose-200",
      gradient: "from-rose-200 to-rose-300",
      darkBg: "dark:bg-rose-900/30",
      darkHover: "dark:hover:bg-rose-800/40",
      darkGradient: "dark:from-rose-800 dark:to-rose-900"
    }
  }
];
