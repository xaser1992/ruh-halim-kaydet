
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
    labelTr: "Çok Kötü", 
    labelEn: "Very Bad",
    labelDe: "Sehr schlecht",
    labelFr: "Très mauvais",
    labelEs: "Muy malo",
    labelIt: "Molto male",
    labelRu: "Очень плохо",
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
  }
];
