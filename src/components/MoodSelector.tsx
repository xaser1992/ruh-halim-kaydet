
import { moodOptions } from "@/utils/moodData";

interface MoodSelectorProps {
  selectedMood: string;
  onMoodSelect: (mood: string) => void;
  language: 'tr' | 'en' | 'de' | 'fr' | 'es' | 'it' | 'ru';
  theme: 'light' | 'dark' | 'feminine';
}

export const MoodSelector = ({ selectedMood, onMoodSelect, language, theme }: MoodSelectorProps) => {
  const getMoodLabel = (mood: any) => {
    switch (language) {
      case 'tr': return mood.labelTr;
      case 'en': return mood.labelEn;
      case 'de': return mood.labelDe;
      case 'fr': return mood.labelFr;
      case 'es': return mood.labelEs;
      case 'it': return mood.labelIt;
      case 'ru': return mood.labelRu;
      default: return mood.labelEn;
    }
  };

  return (
    <div className="grid grid-cols-5 gap-2">
      {moodOptions.map((mood) => (
        <button
          key={mood.id}
          onClick={() => onMoodSelect(mood.id)}
          className={`flex flex-col items-center p-2 rounded-xl transition-all duration-200 ${
            selectedMood === mood.id
              ? `bg-gradient-to-br ${mood.colors.gradient} ${theme === 'dark' ? mood.colors.darkGradient : ''} shadow-lg scale-105`
              : `${mood.colors.bg} ${mood.colors.hover} ${theme === 'dark' ? `${mood.colors.darkBg} ${mood.colors.darkHover}` : ''} hover:scale-105`
          }`}
        >
          <span className="text-xl mb-1">{mood.emoji}</span>
          <span className={`text-xs text-center font-medium transition-colors duration-300 ${
            theme === 'dark' ? 'text-gray-200' : theme === 'feminine' ? 'text-pink-700' : 'text-gray-700'
          }`}>
            {getMoodLabel(mood)}
          </span>
        </button>
      ))}
    </div>
  );
};
